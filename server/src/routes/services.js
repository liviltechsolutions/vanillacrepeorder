const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const services = await prisma.service.findMany({ orderBy: { id: "asc" } });
    res.json(services);
  });

  router.post("/", async (req, res) => {
    const { name, duration, price } = req.body;
    const service = await prisma.service.create({ data: { name, duration, price } });
    res.status(201).json(service);
  });

  return router;
};
