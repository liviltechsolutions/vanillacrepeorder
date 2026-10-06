const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const schedules = await prisma.schedule.findMany({ where: { merchantId: req.merchantId } });
    const byStaffId = {};
    schedules.forEach((s) => {
      byStaffId[s.staffId] = s.data;
    });
    res.json(byStaffId);
  });

  // mirrors handleSaveSched(staffId, schedule)
  router.put("/:staffId", async (req, res) => {
    const staffId = Number(req.params.staffId);
    const merchantId = req.merchantId;
    const schedule = await prisma.schedule.upsert({
      where: { merchantId_staffId: { merchantId, staffId } },
      update: { data: req.body },
      create: { merchantId, staffId, data: req.body },
    });
    res.json(schedule);
  });

  return router;
};
