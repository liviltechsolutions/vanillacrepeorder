const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const leave = await prisma.leaveRecord.findMany({ where: { merchantId: req.merchantId }, orderBy: { id: "asc" } });
    res.json(leave);
  });

  // mirrors handleLeave(staffId, dates, leaveType, reason, affected, reassign)
  router.post("/", async (req, res) => {
    const { staffId, dates, leaveType, reason, affected, reassign } = req.body;
    const now = req.body.now || new Date().toISOString();
    const merchantId = req.merchantId;

    const staffList = await prisma.staff.findMany({ where: { merchantId } });
    const stf = (id) => staffList.find((s) => s.id === id);

    const [leaveRecord, updatedBookings] = await prisma.$transaction(async (tx) => {
      const record = await tx.leaveRecord.create({
        data: { merchantId, staffId, dates, leaveType, reason },
      });

      const updated = [];
      for (const a of affected) {
        const booking = await tx.booking.findFirst({ where: { id: a.id, merchantId } });
        if (!booking) continue;
        const history = booking.history || [];
        if (reassign > 0) {
          updated.push(
            await tx.booking.update({
              where: { id: a.id },
              data: {
                staff: reassign,
                history: [
                  ...history,
                  { field: "Staff", from: stf(staffId)?.name, to: stf(reassign)?.name, at: now },
                ],
              },
            })
          );
        } else {
          updated.push(
            await tx.booking.update({
              where: { id: a.id },
              data: {
                status: "unassigned",
                staff: 0,
                history: [
                  ...history,
                  { field: "Staff", from: stf(staffId)?.name, to: "Unassigned", at: now },
                ],
              },
            })
          );
        }
      }
      return [record, updated];
    });

    res.status(201).json({ leaveRecord, updatedBookings });
  });

  return router;
};
