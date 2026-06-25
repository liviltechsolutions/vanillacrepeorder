const express = require("express");
const router = express.Router();

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const bookings = await prisma.booking.findMany({ orderBy: { id: "asc" } });
    res.json(bookings);
  });

  router.post("/", async (req, res) => {
    const { id, ...form } = req.body;
    const booking = await prisma.booking.create({
      data: { ...form, status: "confirmed", history: [] },
    });
    res.status(201).json(booking);
  });

  // Partial update — used for accept / cancel / edit-save, mirrors handleAccept/handleCancel/handleSaveEdit
  router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const booking = await prisma.booking.update({
      where: { id },
      data: req.body,
    });
    res.json(booking);
  });

  return router;
};
