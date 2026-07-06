const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { hashPassword, verifyPassword } = require("../auth");

let nodemailer;
try { nodemailer = require("nodemailer"); } catch (_) {}

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
  const link = `http://localhost:4000/api/settings/verify-email?token=${token}`;
  transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: toEmail,
    subject: `${companyName} — Verify your email`,
    html: `<p>Click to verify your Beaubook account email:</p><p><a href="${link}">${link}</a></p>`,
  }).catch(err => console.error("Email send failed:", err.message));
}

const SETTING_FIELDS = [
  "companyName", "location", "notifyOnPending", "notifyBefore",
  "contactPhone", "address", "personInCharge",
  "facebook", "instagram", "tiktok", "xhs", "youtube", "twitter", "whatsapp",
  "email", "emailVerified",
];

function pickPublic(s) {
  const out = {};
  SETTING_FIELDS.forEach(f => { if (s[f] !== undefined) out[f] = s[f]; });
  return out;
}

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json(pickPublic(s));
  });

  // Returns whether the account has a verified email (used by LoginScreen)
  router.get("/login-mode", async (req, res) => {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json({ hasEmail: !!(s.email && s.emailVerified) });
  });

  router.put("/", async (req, res) => {
    const allowed = [
      "companyName", "location", "notifyOnPending", "notifyBefore",
      "contactPhone", "address", "personInCharge",
      "facebook", "instagram", "tiktok", "xhs", "youtube", "twitter", "whatsapp",
    ];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    const s = await prisma.settings.update({ where: { id: 1 }, data });
    res.json(pickPublic(s));
  });

  // Register/update account email — generates a verification token
  router.post("/register-email", async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ ok: false, error: "Invalid email" });
    const token = crypto.randomBytes(32).toString("hex");
    const s = await prisma.settings.update({
      where: { id: 1 },
      data: { email, emailVerified: false, emailVerifyToken: token },
    });
    sendVerifyEmail(email, token, s.companyName);
    // Return token so the UI can show a clickable link in dev mode (no SMTP needed)
    res.json({ ok: true, token, verifyUrl: `/api/settings/verify-email?token=${token}` });
  });

  // Verify email via token (browser-navigable link)
  router.get("/verify-email", async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!s.emailVerifyToken || s.emailVerifyToken !== token) {
      return res.status(400).send("Invalid or expired verification link.");
    }
    await prisma.settings.update({
      where: { id: 1 },
      data: { emailVerified: true, emailVerifyToken: null },
    });
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>✅ Email Verified!</h2><p>Your email <strong>${s.email}</strong> has been verified.</p><p><a href="http://localhost:3000">Return to Beaubook</a></p></body></html>`);
  });

  router.post("/login", async (req, res) => {
    const { password, email } = req.body;
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    // If email login attempted, verify email matches
    if (email && s.email && s.emailVerified) {
      if (email.toLowerCase() !== s.email.toLowerCase()) {
        return res.status(401).json({ ok: false, error: "Email not recognised" });
      }
    }
    const ok = verifyPassword(password || "", s.passwordHash, s.passwordSalt);
    if (!ok) return res.status(401).json({ ok: false });
    res.json({ ok: true });
  });

  router.post("/password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!verifyPassword(currentPassword || "", s.passwordHash, s.passwordSalt)) {
      return res.status(401).json({ ok: false, error: "Current password is incorrect" });
    }
    const { hash, salt } = hashPassword(newPassword);
    await prisma.settings.update({ where: { id: 1 }, data: { passwordHash: hash, passwordSalt: salt } });
    res.json({ ok: true });
  });

  return router;
};
