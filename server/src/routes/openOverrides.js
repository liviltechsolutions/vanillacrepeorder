const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const overrides = await prisma.openOverride.findMany({ orderBy: { date: "asc" } });
    res.json(overrides);
  });

  router.post("/", async (req, res) => {
    const { date, reason } = req.body;
    const override = await prisma.openOverride.upsert({
      where: { date },
      update: { reason },
      create: { date, reason: reason || null },
    });
    res.status(201).json(override);
  });

  router.delete("/:date", async (req, res) => {
    await prisma.openOverride.delete({ where: { date: req.params.date } });
    res.status(204).end();
  });

  return router;
};
