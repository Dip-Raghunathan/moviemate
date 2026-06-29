const nodemailer = require('nodemailer');

// Creates a transporter from env vars. Works with Gmail SMTP, SendGrid SMTP,
// Mailtrap, or Resend's SMTP relay (smtp.resend.com) - just swap env values.
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587/others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #141414; color: #f5f5f5; padding: 30px; border-radius: 12px;">
      <h2 style="color: #E50914;">PhilixMate</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block; background: linear-gradient(135deg,#E50914,#ff4b4b); color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin: 20px 0;">Reset Password</a>
      <p style="color:#aaaaaa; font-size: 0.85rem;">If you didn't request this, you can safely ignore this email.</p>
      <p style="color:#aaaaaa; font-size: 0.8rem;">Or paste this link in your browser: ${resetUrl}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Reset your PhilixMate password',
    html,
  });
};

module.exports = { sendPasswordResetEmail };
