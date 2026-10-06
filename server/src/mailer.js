let nodemailer;
try { nodemailer = require("nodemailer"); } catch (_) {}

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

function getTransporter() {
  if (!nodemailer) return null;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function sendVerifyEmail(toEmail, token, companyName) {
  const transporter = getTransporter();
  if (!transporter) return;
  const link = `${APP_ORIGIN}/api/auth/verify-email?token=${token}`;
  transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: `${companyName || "Beaubook"} — Verify your email`,
    html: `<p>Click to verify your Beaubook account email:</p><p><a href="${link}">${link}</a></p>`,
  }).catch(err => console.error("Email send failed:", err.message));
}

function sendResetEmail(toEmail, token, companyName) {
  const transporter = getTransporter();
  if (!transporter) return;
  const link = `${APP_ORIGIN}/merchantdash?resetToken=${token}`;
  transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: `${companyName || "Beaubook"} — Reset your password`,
    html: `<p>Click to set a new password for your Beaubook account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  }).catch(err => console.error("Email send failed:", err.message));
}

module.exports = { sendVerifyEmail, sendResetEmail, APP_ORIGIN };
