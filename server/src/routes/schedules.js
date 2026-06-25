const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const schedules = await prisma.schedule.findMany();
    const byStaffId = {};
    schedules.forEach((s) => {
      byStaffId[s.staffId] = s.data;
    });
    res.json(byStaffId);
  });

  // mirrors handleSaveSched(staffId, schedule)
  router.put("/:staffId", async (req, res) => {
    const staffId = Number(req.params.staffId);
    const schedule = await prisma.schedule.upsert({
      where: { staffId },
      update: { data: req.body },
      create: { staffId, data: req.body },
    });
    res.json(schedule);
  });

  return router;
};
