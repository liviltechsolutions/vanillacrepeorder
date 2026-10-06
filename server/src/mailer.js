let nodemailer;
try { nodemailer = require("nodemailer"); } catch (_) {}

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

function sendVerifyEmail(toEmail, token, companyName) {
  if (!nodemailer) return;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const link = `${APP_ORIGIN}/api/auth/verify-email?token=${token}`;
  transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: toEmail,
    subject: `${companyName || "Beaubook"} — Verify your email`,
    html: `<p>Click to verify your Beaubook account email:</p><p><a href="${link}">${link}</a></p>`,
  }).catch(err => console.error("Email send failed:", err.message));
}

module.exports = { sendVerifyEmail, APP_ORIGIN };
