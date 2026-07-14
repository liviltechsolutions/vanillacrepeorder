const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const services = await prisma.service.findMany({ orderBy: { id: "asc" } });
    res.json(services);
  });

  router.post("/", async (req, res) => {
    const { name, duration, price } = req.body;
    const service = await prisma.service.create({ data: { name, duration: Number(duration), price: Number(price) } });
    res.status(201).json(service);
  });

  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, duration, price } = req.body;
    const service = await prisma.service.update({ where: { id }, data: { name, duration: Number(duration), price: Number(price) } });
    res.json(service);
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    await prisma.service.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
};
