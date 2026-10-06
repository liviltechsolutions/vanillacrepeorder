const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const merchantId = req.merchantId;
    const [extraRows, noteRows] = await Promise.all([
      prisma.customerExtra.findMany({ where: { merchantId } }),
      prisma.customerNote.findMany({ where: { merchantId } }),
    ]);
    const extra = {};
    extraRows.forEach((r) => {
      extra[r.phone] = { ic: r.ic, email: r.email, gender: r.gender, birthday: r.birthday };
    });
    const notes = {};
    noteRows.forEach((r) => {
      notes[r.phone] = r.note;
    });
    res.json({ extra, notes });
  });

  // mirrors handleSaveCustomer(form) — oldPhone is editCustomer.phone, body.phone may be a new phone number
  router.put("/:oldPhone", async (req, res) => {
    const { oldPhone } = req.params;
    const { name, phone, ic, email, gender, birthday } = req.body;
    const merchantId = req.merchantId;

    const [extra, updatedBookings] = await prisma.$transaction(async (tx) => {
      const extra = await tx.customerExtra.upsert({
        where: { merchantId_phone: { merchantId, phone } },
        update: { ic, email, gender, birthday },
        create: { merchantId, phone, ic, email, gender, birthday },
      });
      await tx.booking.updateMany({
        where: { phone: oldPhone, merchantId },
        data: { customer: name },
      });
      const updatedBookings = await tx.booking.findMany({ where: { phone: oldPhone, merchantId } });
      return [extra, updatedBookings];
    });

    res.json({ extra, updatedBookings });
  });

  // mirrors setCustNotes save-note button
  router.put("/:phone/note", async (req, res) => {
    const { phone } = req.params;
    const { note } = req.body;
    const merchantId = req.merchantId;
    const saved = await prisma.customerNote.upsert({
      where: { merchantId_phone: { merchantId, phone } },
      update: { note },
      create: { merchantId, phone, note },
    });
    res.json(saved);
  });

  return router;
};
