const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { hashPassword, verifyPassword, signMerchantToken, COOKIE_NAME, cookieOptions } = require("../auth");
const { sendVerifyEmail, APP_ORIGIN } = require("../mailer");

const PUBLIC_FIELDS = [
  "id", "companyName", "location", "businessType", "notifyOnPending", "notifyBefore",
  "contactPhone", "address", "personInCharge",
  "facebook", "instagram", "tiktok", "xhs", "youtube", "twitter", "whatsapp",
  "email", "emailVerified", "seats",
];
function pickPublic(m) {
  const out = {};
  PUBLIC_FIELDS.forEach(f => { if (m[f] !== undefined) out[f] = m[f]; });
  return out;
}

module.exports = (prisma, requireAuth) => {
  router.post("/register", async (req, res) => {
    const { personInCharge, companyName, address, contactPhone, email, password, businessType } = req.body;
    if (!companyName || !String(companyName).trim()) return res.status(400).json({ ok: false, error: "Company name is required." });
    if (!email || !String(email).includes("@")) return res.status(400).json({ ok: false, error: "A valid email is required." });
    if (!password || password.length < 8) return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });

    const normEmail = email.trim().toLowerCase();
    const existing = await prisma.merchant.findUnique({ where: { email: normEmail } });
    if (existing) return res.status(409).json({ ok: false, error: "An account with this email already exists." });

    const { hash, salt } = hashPassword(password);
    const token = crypto.randomBytes(32).toString("hex");
    const merchant = await prisma.merchant.create({
      data: {
        companyName: companyName.trim(),
        personInCharge: personInCharge || null,
        address: address || null,
        contactPhone: contactPhone || null,
        businessType: businessType || null,
        email: normEmail,
        passwordHash: hash,
        passwordSalt: salt,
        emailVerified: false,
        emailVerifyToken: token,
      },
    });
    sendVerifyEmail(merchant.email, token, merchant.companyName);
    res.json({ ok: true, verifyUrl: `/api/auth/verify-email?token=${token}` });
  });

  // Shared by both signup verification and the "change account email" flow in settings.js —
  // both just set emailVerifyToken on a Merchant row and point here.
  router.get("/verify-email", async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");
    const merchant = await prisma.merchant.findFirst({ where: { emailVerifyToken: token } });
    if (!merchant) return res.status(400).send("Invalid or expired verification link.");
    await prisma.merchant.update({ where: { id: merchant.id }, data: { emailVerified: true, emailVerifyToken: null } });
    res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>✅ Email Verified!</h2><p>Your email <strong>${merchant.email}</strong> has been verified.</p><p><a href="${APP_ORIGIN}/merchantdash">Log in to Beaubook</a></p></body></html>`);
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(401).json({ ok: false, error: "fail" });
    const merchant = await prisma.merchant.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!merchant) return res.status(401).json({ ok: false, error: "fail" });
    if (!merchant.emailVerified) return res.status(401).json({ ok: false, error: "unverified" });
    const ok = verifyPassword(password, merchant.passwordHash, merchant.passwordSalt);
    if (!ok) return res.status(401).json({ ok: false, error: "fail" });
    const token = signMerchantToken(merchant.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({ ok: true, merchant: pickPublic(merchant) });
  });

  router.post("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.json({ ok: true });
  });

  router.get("/me", requireAuth, async (req, res) => {
    const merchant = await prisma.merchant.findUnique({ where: { id: req.merchantId } });
    if (!merchant) return res.status(401).json({ error: "unauthorized" });
    res.json({ merchant: pickPublic(merchant) });
  });

  return router;
};
