const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const closedWeekdays = await prisma.closedWeekday.findMany({ orderBy: { weekday: "asc" } });
    res.json(closedWeekdays);
  });

  router.post("/", async (req, res) => {
    const { weekday, reason } = req.body;
    const closedWeekday = await prisma.closedWeekday.upsert({
      where: { weekday },
      update: { reason },
      create: { weekday, reason },
    });
    res.status(201).json(closedWeekday);
  });

  router.delete("/:weekday", async (req, res) => {
    await prisma.closedWeekday.delete({ where: { weekday: Number(req.params.weekday) } });
    res.status(204).end();
  });

  return router;
};
