const express = require("express");
const router = express.Router();

module.exports = (prisma, requireAuth) => {
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const products = await prisma.product.findMany({ where: { merchantId: req.merchantId }, orderBy: { id: "asc" } });
    res.json(products);
  });

  router.post("/", async (req, res) => {
    const { name, description, price, offerPrice, discount, inventory, category, image } = req.body;
    const product = await prisma.product.create({
      data: {
        merchantId: req.merchantId,
        name, description: description || null,
        price: Number(price) || 0,
        offerPrice: offerPrice != null && offerPrice !== "" ? Number(offerPrice) : null,
        discount: discount != null && discount !== "" ? Number(discount) : null,
        inventory: Number(inventory) || 0,
        category: category || null,
        image: image || null,
      },
    });
    res.status(201).json(product);
  });

  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.product.findFirst({ where: { id, merchantId: req.merchantId } });
    if (!existing) return res.status(404).json({ error: "not found" });
    const { name, description, price, offerPrice, discount, inventory, category, image } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name, description: description || null,
        price: Number(price) || 0,
        offerPrice: offerPrice != null && offerPrice !== "" ? Number(offerPrice) : null,
        discount: discount != null && discount !== "" ? Number(discount) : null,
        inventory: Number(inventory) || 0,
        category: category || null,
        image: image || null,
      },
    });
    res.json(product);
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.product.findFirst({ where: { id, merchantId: req.merchantId } });
    if (!existing) return res.status(404).json({ error: "not found" });
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
};
