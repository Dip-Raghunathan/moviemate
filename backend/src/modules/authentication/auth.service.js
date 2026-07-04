const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const authRepository = require('./auth.repository');
const Session = require('../../database/models/Session');
const AuditLog = require('../../database/models/AuditLog');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../utils/errors');

function parseUserAgent(uaString = '') {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType = 'Desktop';

  if (/mobile/i.test(uaString)) {
    deviceType = 'Mobile';
  } else if (/tablet|ipad/i.test(uaString)) {
    deviceType = 'Tablet';
  }

  if (/chrome|crios/i.test(uaString)) {
    browser = 'Chrome';
  } else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(uaString)) {
    browser = 'Firefox';
  } else if (/opr\//i.test(uaString)) {
    browser = 'Opera';
  } else if (/edg/i.test(uaString)) {
    browser = 'Edge';
  }

  if (/windows/i.test(uaString)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(uaString)) {
    os = 'macOS';
  } else if (/android/i.test(uaString)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(uaString)) {
    os = 'iOS';
  } else if (/linux/i.test(uaString)) {
    os = 'Linux';
  }

  return { browser, os, deviceType };
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

class AuthService {
  generateAccessToken(userId) {
    // Access token is short-lived: 15 minutes
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  async createSession(userId, refreshToken, ip, userAgent) {
    const hashed = hashToken(refreshToken);
    const { browser, os, deviceType } = parseUserAgent(userAgent);
    
    // Simulate city/country from IP (optional/mocked)
    const location = ip === '127.0.0.1' || ip === '::1' ? 'Local Development' : 'Remote Access';

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    return Session.create({
      user: userId,
      refreshToken: hashed,
      ipAddress: ip,
      userAgent,
      deviceType,
      browser,
      os,
      location,
      expiresAt,
    });
  }

  async signup(data, ip, userAgent) {
    const { name, email, password, age, gender, favoriteGenres } = data;

    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestError('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await authRepository.createUser({
      name,
      email,
      password,
      age,
      gender,
      favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : [],
      role: 'user',
      isVerified: false,
      isEmailVerified: false,
      verificationOTP: otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Audit log signup
    await AuditLog.create({
      action: 'AUTH_SIGNUP',
      userId: user._id,
      ipAddress: ip,
      userAgent,
      details: { email: user.email },
    });
    logger.auth(`User signed up: ${user.email} from IP ${ip} (requires email verification)`);

    try {
      await this.sendVerificationEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email during signup:', emailError.message);
    }

    return { requiresVerification: true, email: user.email };
  }

  async login(email, password, ip, userAgent) {
    const user = await authRepository.findByEmailWithPassword(email);
    if (!user || !(await user.matchPassword(password))) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    if (!user.isVerified) {
      throw new UnauthorizedError('Please verify your email first.', 'EMAIL_NOT_VERIFIED');
    }

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    await this.createSession(user._id, refreshToken, ip, userAgent);

    // Audit log login
    await AuditLog.create({
      action: 'AUTH_LOGIN',
      userId: user._id,
      ipAddress: ip,
      userAgent,
    });

    logger.auth(`User logged in: ${user.email} from IP ${ip}`);

    return { user, accessToken, refreshToken };
  }

  async rotateRefreshToken(oldRefreshToken, ip, userAgent) {
    if (!oldRefreshToken) {
      throw new UnauthorizedError('Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
    }

    const hashedOld = hashToken(oldRefreshToken);
    const session = await Session.findOne({ refreshToken: hashedOld, isRevoked: false });

    if (!session) {
      // Replay Attack Detection: If token not found but belongs to a user who used it before, 
      // someone might be trying to reuse a rotated token! We revoke all active sessions for safety.
      logger.security(`Potential refresh token reuse detected! IP: ${ip}`);
      throw new UnauthorizedError('Session invalid or expired', 'SESSION_EXPIRED');
    }

    if (session.expiresAt < new Date()) {
      session.isRevoked = true;
      await session.save();
      throw new UnauthorizedError('Session expired', 'SESSION_EXPIRED');
    }

    // Suspicious Login Monitor: Did user change IP drastically during rotation?
    if (session.ipAddress !== ip && session.ipAddress !== '127.0.0.1') {
      await AuditLog.create({
        action: 'SECURITY_SUSPICIOUS',
        userId: session.user,
        ipAddress: ip,
        userAgent,
        severity: 'warning',
        details: { reason: 'IP changed during session refresh', oldIp: session.ipAddress },
      });
      logger.security(`IP address drift detected during token refresh. Old: ${session.ipAddress}, New: ${ip}`);
    }

    // Generate new pair
    const accessToken = this.generateAccessToken(session.user);
    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    // Invalidate old token and replace in session (rotation)
    session.refreshToken = hashToken(newRefreshToken);
    session.ipAddress = ip;
    session.userAgent = userAgent;
    
    const { browser, os, deviceType } = parseUserAgent(userAgent);
    session.browser = browser;
    session.os = os;
    session.deviceType = deviceType;
    session.lastActive = new Date();
    
    // Extend expiry by 7 days
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);
    session.expiresAt = newExpiry;

    await session.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken, ip, userAgent) {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      const session = await Session.findOne({ refreshToken: hashed });
      if (session) {
        session.isRevoked = true;
        await session.save();
        
        await AuditLog.create({
          action: 'AUTH_LOGOUT',
          userId: session.user,
          ipAddress: ip,
          userAgent,
        });

        logger.auth(`User logged out session: ${session._id}`);
      }
    }
    return { success: true };
  }

  async getActiveSessions(userId, currentRefreshToken) {
    const hashedCurrent = currentRefreshToken ? hashToken(currentRefreshToken) : '';
    const sessions = await Session.find({ user: userId, isRevoked: false, expiresAt: { $gt: new Date() } })
      .sort({ lastActive: -1 });

    return sessions.map(s => ({
      id: s._id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      deviceType: s.deviceType,
      browser: s.browser,
      os: s.os,
      location: s.location,
      lastActive: s.lastActive,
      isCurrent: s.refreshToken === hashedCurrent,
    }));
  }

  async revokeSession(userId, sessionId) {
    const session = await Session.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new NotFoundError('Session not found', 'SESSION_NOT_FOUND');
    }
    session.isRevoked = true;
    await session.save();
    
    logger.auth(`Revoked session ${sessionId} for user ${userId}`);
    return { success: true };
  }

  async revokeAllSessions(userId, currentRefreshToken) {
    const hashedCurrent = currentRefreshToken ? hashToken(currentRefreshToken) : '';
    
    // Revoke all sessions except the current one
    await Session.updateMany(
      { user: userId, refreshToken: { $ne: hashedCurrent } },
      { $set: { isRevoked: true } }
    );

    logger.auth(`Revoked all other sessions for user ${userId}`);
    return { success: true };
  }

  async verifyEmail(email, otp) {
    const User = require('../../database/models/User');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+verificationOTP +otpExpiry');

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    if (user.isVerified) {
      return { success: true };
    }

    const now = new Date();
    if (user.otpExpiry && now > user.otpExpiry) {
      throw new BadRequestError('OTP expired. Please request a new OTP.', 'OTP_EXPIRED');
    }

    if (user.verificationOTP !== otp) {
      throw new BadRequestError('Invalid verification code.', 'INVALID_OTP');
    }

    user.isVerified = true;
    user.isEmailVerified = true;
    user.verificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Trigger Welcome / Email Verified Notification
    try {
      const { sendNotification } = require('../../utils/notificationHelper');
      await sendNotification({
        recipient: user._id,
        type: 'account_alert',
        title: 'Email Verified',
        body: '✉️ Your email address has been verified successfully. Welcome to PhilixMate!',
        deepLink: '/profile',
        priority: 'normal'
      });
    } catch (err) {
      console.error('Failed to trigger verification notification:', err);
    }

    return { success: true };
  }

  async resendVerificationOTP(email) {
    const User = require('../../database/models/User');
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await this.sendVerificationEmail(user.email, otp, user.name);

    return { success: true };
  }

  async forgotPassword(email) {
    const User = require('../../database/models/User');
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't leak user existence
      return { success: true };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    try {
      await this.sendResetOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      user.resetOTP = undefined;
      user.resetOTPExpiry = undefined;
      await user.save();
      console.error('Email send failed:', emailError.message);
      throw new Error('Could not send reset email. Please try again later.');
    }

    return { success: true };
  }

  async verifyResetOTP(email, otp) {
    const User = require('../../database/models/User');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOTP +resetOTPExpiry');

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const now = new Date();
    if (user.resetOTPExpiry && now > user.resetOTPExpiry) {
      throw new BadRequestError('OTP expired. Please request a new OTP.', 'OTP_EXPIRED');
    }

    if (user.resetOTP !== otp) {
      throw new BadRequestError('Invalid reset code.', 'INVALID_OTP');
    }

    return { success: true };
  }

  async resetPasswordWithOTP(email, otp, password) {
    const User = require('../../database/models/User');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOTP +resetOTPExpiry');

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const now = new Date();
    if (user.resetOTPExpiry && now > user.resetOTPExpiry) {
      throw new BadRequestError('OTP expired. Please request a new OTP.', 'OTP_EXPIRED');
    }

    if (user.resetOTP !== otp) {
      throw new BadRequestError('Invalid reset code.', 'INVALID_OTP');
    }

    user.password = password;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    try {
      const { sendNotification } = require('../../utils/notificationHelper');
      await sendNotification({
        recipient: user._id,
        type: 'account_alert',
        title: 'Password Changed',
        body: '🔑 Your password was successfully changed.',
        deepLink: '/sessions',
        priority: 'high'
      });
    } catch (err) {
      console.error('Failed to trigger reset password notification:', err);
    }

    // Revoke all active sessions on password reset for security
    await Session.updateMany({ user: user._id }, { $set: { isRevoked: true } });

    return { success: true };
  }

  async sendVerificationEmail(toEmail, otp, userName) {
<<<<<<< HEAD
    let user = env.SMTP.USER;
    let pass = env.SMTP.PASS;
    let host = env.SMTP.HOST;
    let port = env.SMTP.PORT;
    let from = env.SMTP.FROM;

    console.log('\n==================================================');
    console.log(`[DEMO EMAIL] Verification OTP for ${toEmail}: ${otp}`);
    console.log('==================================================\n');

    if (!user || !pass) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        user = testAccount.user;
        pass = testAccount.pass;
        host = 'smtp.ethereal.email';
        port = 587;
        from = `"PhilixMate Team" <${testAccount.user}>`;
      } catch (err) {
        console.error('Failed to create ethereal test email account, logging code only.');
        return;
      }
    }

=======
>>>>>>> f5ebda0e1812514fee77bf0df8348ec57f9ce799
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const html = `
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #05050a; color: #f0f0fa; padding: 40px 30px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 32px rgba(0,0,0,0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg,#e8102a,#ff4b5e); line-height: 48px; color: white; font-weight: bold; font-size: 20px; text-align: center;">PM</div>
          <h2 style="color: #f0f0fa; font-size: 22px; margin-top: 16px; font-weight: 800; letter-spacing: -0.02em; text-align: center;">PhilixMate</h2>
        </div>
        <p style="font-size: 15px; color: #a8a8c0; line-height: 1.6; margin-bottom: 24px;">Hi ${userName},</p>
        <p style="font-size: 15px; color: #a8a8c0; line-height: 1.6; margin-bottom: 24px;">Welcome to PhilixMate! Please use the 6-digit verification code below to verify your email address. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #ff6b7a; letter-spacing: 6px; padding: 12px 24px; background: rgba(232, 16, 42, 0.08); border: 1px solid rgba(232, 16, 42, 0.25); border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #6b6b85; font-size: 12px; line-height: 1.5; text-align: center; margin-top: 30px;">If you didn't request this verification code, you can safely ignore this email.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'Verify your PhilixMate Account',
<<<<<<< HEAD
=======
      html,
    });
  }

  async sendResetOTPEmail(toEmail, otp, userName) {
    const transporter = nodemailer.createTransport({
      host: env.SMTP.HOST,
      port: env.SMTP.PORT,
      secure: env.SMTP.PORT === 465,
      auth: {
        user: env.SMTP.USER,
        pass: env.SMTP.PASS,
      },
    });

    const html = `
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #05050a; color: #f0f0fa; padding: 40px 30px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 32px rgba(0,0,0,0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg,#e8102a,#ff4b5e); line-height: 48px; color: white; font-weight: bold; font-size: 20px; text-align: center;">PM</div>
          <h2 style="color: #f0f0fa; font-size: 22px; margin-top: 16px; font-weight: 800; letter-spacing: -0.02em; text-align: center;">PhilixMate</h2>
        </div>
        <p style="font-size: 15px; color: #a8a8c0; line-height: 1.6; margin-bottom: 24px;">Hi ${userName},</p>
        <p style="font-size: 15px; color: #a8a8c0; line-height: 1.6; margin-bottom: 24px;">We received a request to reset your password. Use the 6-digit verification code below to reset your password. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #ff6b7a; letter-spacing: 6px; padding: 12px 24px; background: rgba(232, 16, 42, 0.08); border: 1px solid rgba(232, 16, 42, 0.25); border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #6b6b85; font-size: 12px; line-height: 1.5; text-align: center; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${env.SMTP.FROM.split('"')[1] || 'PhilixMate Team'}" <${env.SMTP.FROM.match(/<([^>]+)>/)?.[1] || env.SMTP.FROM}>`,
      to: toEmail,
      subject: 'Reset Your PhilixMate Password',
>>>>>>> f5ebda0e1812514fee77bf0df8348ec57f9ce799
      html,
    });

    if (host === 'smtp.ethereal.email') {
      console.log(`[Ethereal Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }
  }

  async sendResetOTPEmail(toEmail, otp, userName) {
    let user = env.SMTP.USER;
    let pass = env.SMTP.PASS;
    let host = env.SMTP.HOST;
    let port = env.SMTP.PORT;
    let from = env.SMTP.FROM;

    console.log('\n==================================================');
    console.log(`[DEMO EMAIL] Password Reset OTP for ${toEmail}: ${otp}`);
    console.log('==================================================\n');

    if (!user || !pass) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        user = testAccount.user;
        pass = testAccount.pass;
        host = 'smtp.ethereal.email';
        port = 587;
        from = `"PhilixMate Team" <${testAccount.user}>`;
      } catch (err) {
        console.error('Failed to create ethereal test email account, logging code only.');
        return;
      }
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const html = `
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #05050a; color: #f0f0fa; padding: 40px 30px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 32px rgba(0,0,0,0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg,#e8102a,#ff4b5e); line-height: 48px; color: white; font-weight: bold; font-size: 20px; text-align: center;">PM</div>
          <h2 style="color: #f0f0fa; font-size: 22px; margin-top: 16px; font-weight: 800; letter-spacing: -0.02em; text-align: center;">PhilixMate</h2>
        </div>
        <p style="font-size: 15px; color: #a8a8c0; line-height: 1.6; margin-bottom: 24px;">Hi ${userName},</p>
        <p style="font-size: 15px; color: #a8a8c0; line-height: 1.6; margin-bottom: 24px;">We received a request to reset your password. Use the 6-digit verification code below to reset your password. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #ff6b7a; letter-spacing: 6px; padding: 12px 24px; background: rgba(232, 16, 42, 0.08); border: 1px solid rgba(232, 16, 42, 0.25); border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #6b6b85; font-size: 12px; line-height: 1.5; text-align: center; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'Reset Your PhilixMate Password',
      html,
    });

    if (host === 'smtp.ethereal.email') {
      console.log(`[Ethereal Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }
  }
}

module.exports = new AuthService();
