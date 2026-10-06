const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const closedWeekdays = await prisma.closedWeekday.findMany({ where: { merchantId: req.merchantId }, orderBy: { weekday: "asc" } });
    res.json(closedWeekdays);
  });

  router.post("/", async (req, res) => {
    const { weekday, reason } = req.body;
    const merchantId = req.merchantId;
    const closedWeekday = await prisma.closedWeekday.upsert({
      where: { merchantId_weekday: { merchantId, weekday } },
      update: { reason },
      create: { merchantId, weekday, reason },
    });
    res.status(201).json(closedWeekday);
  });

  router.delete("/:weekday", async (req, res) => {
    await prisma.closedWeekday.delete({ where: { merchantId_weekday: { merchantId: req.merchantId, weekday: Number(req.params.weekday) } } }).catch(() => {});
    res.status(204).end();
  });

  return router;
};
