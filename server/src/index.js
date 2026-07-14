require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({limit:"10mb"}));

app.use("/api/bookings", require("./routes/bookings")(prisma));
app.use("/api/staff", require("./routes/staff")(prisma));
app.use("/api/leave", require("./routes/leave")(prisma));
app.use("/api/schedules", require("./routes/schedules")(prisma));
app.use("/api/customers", require("./routes/customers")(prisma));
app.use("/api/closed-dates", require("./routes/closedDates")(prisma));
app.use("/api/closed-weekdays", require("./routes/closedWeekdays")(prisma));
app.use("/api/services", require("./routes/services")(prisma));
app.use("/api/products", require("./routes/products")(prisma));
app.use("/api/settings", require("./routes/settings")(prisma));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Beaubook API listening on http://localhost:${PORT}`));
