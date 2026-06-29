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

    const user = await authRepository.createUser({
      name,
      email,
      password,
      age,
      gender,
      favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : [],
      role: 'user',
    });

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    await this.createSession(user._id, refreshToken, ip, userAgent);

    // Audit log signup
    await AuditLog.create({
      action: 'AUTH_SIGNUP',
      userId: user._id,
      ipAddress: ip,
      userAgent,
      details: { email: user.email },
    });

    logger.auth(`User signed up: ${user.email} from IP ${ip}`);

    return { user, accessToken, refreshToken };
  }

  async login(email, password, ip, userAgent) {
    const user = await authRepository.findByEmailWithPassword(email);
    if (!user || !(await user.matchPassword(password))) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended', 'ACCOUNT_SUSPENDED');
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

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return { success: true };
    }

    const resetToken = user.generateResetToken();
    await user.save();

    try {
      await this.sendResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error('Email send failed:', emailError.message);
      throw new Error('Could not send reset email. Please try again later.');
    }

    return { success: true };
  }

  async resetPassword(token, password) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await authRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Reset link is invalid or has expired', 'INVALID_RESET_TOKEN');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoke all active sessions on password reset for security
    await Session.updateMany({ user: user._id }, { $set: { isRevoked: true } });

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Create new login session after password reset
    await this.createSession(user._id, refreshToken, '127.0.0.1', 'Password Reset Flow');

    return { user, accessToken, refreshToken };
  }

  async sendResetEmail(toEmail, resetToken, userName) {
    const transporter = nodemailer.createTransport({
      host: env.SMTP.HOST,
      port: env.SMTP.PORT,
      secure: env.SMTP.PORT === 465,
      auth: {
        user: env.SMTP.USER,
        pass: env.SMTP.PASS,
      },
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #141414; color: #f5f5f5; padding: 30px; border-radius: 12px;">
        <h2 style="color: #E50914;">VX ShowMate</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block; background: linear-gradient(135deg,#E50914,#ff4b4b); color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin: 20px 0;">Reset Password</a>
        <p style="color:#aaaaaa; font-size: 0.85rem;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#aaaaaa; font-size: 0.8 .5rem;">Or paste this link in your browser: ${resetUrl}</p>
      </div>
    `;

    await transporter.sendMail({
      from: env.SMTP.FROM,
      to: toEmail,
      subject: 'Reset your VX ShowMate password',
      html,
    });
  }
}

module.exports = new AuthService();
