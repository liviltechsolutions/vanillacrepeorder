const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { hashPassword, verifyPassword } = require("../auth");
const { sendVerifyEmail } = require("../mailer");

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
  router.get("/", requireAuth, async (req, res) => {
    const m = await prisma.merchant.findUnique({ where: { id: req.merchantId } });
    res.json(pickPublic(m));
  });

  router.put("/", requireAuth, async (req, res) => {
    const allowed = [
      "companyName", "location", "businessType", "notifyOnPending", "notifyBefore",
      "contactPhone", "address", "personInCharge",
      "facebook", "instagram", "tiktok", "xhs", "youtube", "twitter", "whatsapp",
      "seats",
    ];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    const m = await prisma.merchant.update({ where: { id: req.merchantId }, data });
    res.json(pickPublic(m));
  });

  // Change the account email for the logged-in merchant — generates a verification
  // token and reuses the same /api/auth/verify-email endpoint signup uses.
  router.post("/register-email", requireAuth, async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ ok: false, error: "Invalid email" });
    const normEmail = email.trim().toLowerCase();
    const inUse = await prisma.merchant.findUnique({ where: { email: normEmail } });
    if (inUse && inUse.id !== req.merchantId) return res.status(409).json({ ok: false, error: "That email is already in use." });
    const token = crypto.randomBytes(32).toString("hex");
    const m = await prisma.merchant.update({
      where: { id: req.merchantId },
      data: { email: normEmail, emailVerified: false, emailVerifyToken: token },
    });
    sendVerifyEmail(m.email, token, m.companyName);
    res.json({ ok: true, verifyUrl: `/api/auth/verify-email?token=${token}` });
  });

  router.post("/password", requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const m = await prisma.merchant.findUnique({ where: { id: req.merchantId } });
    if (!verifyPassword(currentPassword || "", m.passwordHash, m.passwordSalt)) {
      return res.status(401).json({ ok: false, error: "Current password is incorrect" });
    }
    const { hash, salt } = hashPassword(newPassword);
    await prisma.merchant.update({ where: { id: req.merchantId }, data: { passwordHash: hash, passwordSalt: salt } });
    res.json({ ok: true });
  });

  return router;
};
