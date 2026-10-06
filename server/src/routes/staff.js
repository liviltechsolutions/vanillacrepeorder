const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const staff = await prisma.staff.findMany({ where: { merchantId: req.merchantId }, orderBy: { id: "asc" } });
    res.json(staff);
  });

  // mirrors handleSaveStaff(form, isNew=true)
  router.post("/", async (req, res) => {
    const { id, ...form } = req.body;
    const staff = await prisma.staff.create({ data: { ...form, merchantId: req.merchantId } });
    res.status(201).json(staff);
  });

  // mirrors handleSaveStaff(form, isNew=false)
  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.staff.findFirst({ where: { id, merchantId: req.merchantId } });
    if (!existing) return res.status(404).json({ error: "not found" });
    const { id: _ignored, ...form } = req.body;
    const staff = await prisma.staff.update({ where: { id }, data: form });
    res.json(staff);
  });

  return router;
};
