require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Cache the client on `global` so repeated invocations of the same warm
// serverless instance reuse one connection instead of opening a new one each time.
const prisma = global.__beaubookPrisma || new PrismaClient();
global.__beaubookPrisma = prisma;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/bookings", require("./routes/bookings")(prisma));
app.use("/api/staff", require("./routes/staff")(prisma));
app.use("/api/leave", require("./routes/leave")(prisma));
app.use("/api/schedules", require("./routes/schedules")(prisma));
app.use("/api/customers", require("./routes/customers")(prisma));
app.use("/api/closed-dates", require("./routes/closedDates")(prisma));
app.use("/api/open-overrides", require("./routes/openOverrides")(prisma));
app.use("/api/closed-weekdays", require("./routes/closedWeekdays")(prisma));
app.use("/api/services", require("./routes/services")(prisma));
app.use("/api/products", require("./routes/products")(prisma));
app.use("/api/settings", require("./routes/settings")(prisma));

module.exports = app;
