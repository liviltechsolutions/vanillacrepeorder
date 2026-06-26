const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const closedDates = await prisma.closedDate.findMany({ orderBy: { date: "asc" } });
    res.json(closedDates);
  });

  router.post("/", async (req, res) => {
    const { date, reason } = req.body;
    const closedDate = await prisma.closedDate.upsert({
      where: { date },
      update: { reason },
      create: { date, reason },
    });
    res.status(201).json(closedDate);
  });

  router.delete("/:date", async (req, res) => {
    await prisma.closedDate.delete({ where: { date: req.params.date } });
    res.status(204).end();
  });

  return router;
};
