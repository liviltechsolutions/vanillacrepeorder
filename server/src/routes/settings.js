const express = require("express");
const router = express.Router();
const { hashPassword, verifyPassword } = require("../auth");

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json({ companyName: s.companyName, location: s.location, notifyOnPending: s.notifyOnPending });
  });

  router.put("/", async (req, res) => {
    const { companyName, location, notifyOnPending } = req.body;
    const s = await prisma.settings.update({
      where: { id: 1 },
      data: { companyName, location, notifyOnPending },
    });
    res.json({ companyName: s.companyName, location: s.location, notifyOnPending: s.notifyOnPending });
  });

  router.post("/login", async (req, res) => {
    const { password } = req.body;
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
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
