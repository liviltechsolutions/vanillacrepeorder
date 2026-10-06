const express = require("express");
const router = express.Router();

async function adjustStock(prisma, merchantId, products, direction) {
  // direction: 1 = deduct (sold), -1 = restore (cancelled/removed)
  if (!Array.isArray(products) || products.length === 0) return;
  for (const item of products) {
    if (!item.productId || !item.qty) continue;
    await prisma.product.updateMany({
      where: { id: Number(item.productId), merchantId },
      data: { inventory: { increment: -direction * item.qty } },
    }).catch(() => {});
  }
}

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const bookings = await prisma.booking.findMany({ where: { merchantId: req.merchantId }, orderBy: { id: "asc" } });
    res.json(bookings);
  });

  router.post("/", async (req, res) => {
    const { id, ...form } = req.body;
    const status = form.status || "confirmed";
    const booking = await prisma.booking.create({
      data: { ...form, merchantId: req.merchantId, status, history: [] },
    });
    // Deduct stock for products sold
    if (status !== "cancelled") {
      await adjustStock(prisma, req.merchantId, form.products, 1);
    }
    res.status(201).json(booking);
  });

  // Partial update — used for accept / cancel / edit-save
  router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.booking.findFirst({ where: { id, merchantId: req.merchantId } });
    if (!existing) return res.status(404).json({ error: "not found" });
    // If products are being updated, adjust stock delta
    if (req.body.products !== undefined) {
      const oldProducts = Array.isArray(existing.products) ? existing.products : [];
      const newProducts = Array.isArray(req.body.products) ? req.body.products : [];
      // Restore old stock then deduct new
      await adjustStock(prisma, req.merchantId, oldProducts, -1);
      const newStatus = req.body.status || existing.status;
      if (newStatus !== "cancelled") {
        await adjustStock(prisma, req.merchantId, newProducts, 1);
      }
    } else if (req.body.status === "cancelled") {
      // Booking being cancelled — restore stock
      await adjustStock(prisma, req.merchantId, Array.isArray(existing.products) ? existing.products : [], -1);
    }
    const booking = await prisma.booking.update({ where: { id }, data: req.body });
    res.json(booking);
  });

  return router;
};
