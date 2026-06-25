const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const staff = await prisma.staff.findMany({ orderBy: { id: "asc" } });
    res.json(staff);
  });

  // mirrors handleSaveStaff(form, isNew=true)
  router.post("/", async (req, res) => {
    const { id, ...form } = req.body;
    const staff = await prisma.staff.create({ data: form });
    res.status(201).json(staff);
  });

  // mirrors handleSaveStaff(form, isNew=false)
  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { id: _ignored, ...form } = req.body;
    const staff = await prisma.staff.update({ where: { id }, data: form });
    res.json(staff);
  });

  return router;
};
