const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const overrides = await prisma.openOverride.findMany({ where: { merchantId: req.merchantId }, orderBy: { date: "asc" } });
    res.json(overrides);
  });

  router.post("/", async (req, res) => {
    const { date, reason } = req.body;
    const merchantId = req.merchantId;
    const override = await prisma.openOverride.upsert({
      where: { merchantId_date: { merchantId, date } },
      update: { reason },
      create: { merchantId, date, reason: reason || null },
    });
    res.status(201).json(override);
  });

  router.delete("/:date", async (req, res) => {
    await prisma.openOverride.delete({ where: { merchantId_date: { merchantId: req.merchantId, date: req.params.date } } }).catch(() => {});
    res.status(204).end();
  });

  return router;
};
