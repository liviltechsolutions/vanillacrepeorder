# Vanilla Crepe Partner Portal

An isolated, responsive ordering portal prototype. Open `index.html` in a browser to explore it.

## Demo behavior

- Customer profile, delivery addresses, and orders are saved in this browser's local storage.
- Orders can be reviewed in history, reordered, updated in the admin view, and exported as CSV.
- Submitting an order opens WhatsApp Click-to-Chat to `60197139139` with the order details prefilled.
- Menu images are from the supplied Vanilla Crepe references. Whole cake base prices follow the supplied menu (8 inch RM99 classic, 10 inch RM150 classic, 8 inch RM125 premium, 10 inch RM170 premium). Cup and Batik Cup use the RM12.90 reference price.

## Production integration still needed

This standalone prototype does not yet connect to the BeauBook PostgreSQL database or provide server-side authentication. Local storage is per browser and is not shared with the central kitchen or other devices. Before operational use, wire customer authentication and records to the existing Express/Prisma API, and confirm the menu, customer-specific pricing, delivery schedule rules, and access roles.
