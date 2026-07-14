const express = require("express");
const router = express.Router();

async function adjustStock(prisma, products, direction) {
  // direction: 1 = deduct (sold), -1 = restore (cancelled/removed)
  if (!Array.isArray(products) || products.length === 0) return;
  for (const item of products) {
    if (!item.productId || !item.qty) continue;
    await prisma.product.update({
      where: { id: Number(item.productId) },
      data: { inventory: { increment: -direction * item.qty } },
    }).catch(() => {});
  }
}

module.exports = (prisma) => {
  router.get("/", async (req, res) => {
    const bookings = await prisma.booking.findMany({ orderBy: { id: "asc" } });
    res.json(bookings);
  });

  router.post("/", async (req, res) => {
    const { id, ...form } = req.body;
    const status = form.status || "confirmed";
    const booking = await prisma.booking.create({
      data: { ...form, status, history: [] },
    });
    // Deduct stock for products sold
    if (status !== "cancelled") {
      await adjustStock(prisma, form.products, 1);
    }
    res.status(201).json(booking);
  });

  // Partial update — used for accept / cancel / edit-save
  router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);
    // If products are being updated, adjust stock delta
    if (req.body.products !== undefined) {
      const old = await prisma.booking.findUnique({ where: { id } });
      const oldProducts = Array.isArray(old?.products) ? old.products : [];
      const newProducts = Array.isArray(req.body.products) ? req.body.products : [];
      // Restore old stock then deduct new
      await adjustStock(prisma, oldProducts, -1);
      const newStatus = req.body.status || old?.status;
      if (newStatus !== "cancelled") {
        await adjustStock(prisma, newProducts, 1);
      }
    } else if (req.body.status === "cancelled") {
      // Booking being cancelled — restore stock
      const old = await prisma.booking.findUnique({ where: { id } });
      await adjustStock(prisma, Array.isArray(old?.products) ? old.products : [], -1);
    }
    const booking = await prisma.booking.update({ where: { id }, data: req.body });
    res.json(booking);
  });

  return router;
};
