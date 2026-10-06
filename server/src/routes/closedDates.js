const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const closedDates = await prisma.closedDate.findMany({ where: { merchantId: req.merchantId }, orderBy: { date: "asc" } });
    res.json(closedDates);
  });

  router.post("/", async (req, res) => {
    const { date, reason } = req.body;
    const merchantId = req.merchantId;
    const closedDate = await prisma.closedDate.upsert({
      where: { merchantId_date: { merchantId, date } },
      update: { reason },
      create: { merchantId, date, reason },
    });
    res.status(201).json(closedDate);
  });

  router.delete("/:date", async (req, res) => {
    await prisma.closedDate.delete({ where: { merchantId_date: { merchantId: req.merchantId, date: req.params.date } } }).catch(() => {});
    res.status(204).end();
  });

  return router;
};
