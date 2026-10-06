const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const services = await prisma.service.findMany({ where: { merchantId: req.merchantId }, orderBy: { id: "asc" } });
    res.json(services);
  });

  router.post("/", async (req, res) => {
    const { name, duration, price } = req.body;
    const service = await prisma.service.create({ data: { merchantId: req.merchantId, name, duration: Number(duration), price: Number(price) } });
    res.status(201).json(service);
  });

  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.service.findFirst({ where: { id, merchantId: req.merchantId } });
    if (!existing) return res.status(404).json({ error: "not found" });
    const { name, duration, price } = req.body;
    const service = await prisma.service.update({ where: { id }, data: { name, duration: Number(duration), price: Number(price) } });
    res.json(service);
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.service.findFirst({ where: { id, merchantId: req.merchantId } });
    if (!existing) return res.status(404).json({ error: "not found" });
    await prisma.service.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
};
