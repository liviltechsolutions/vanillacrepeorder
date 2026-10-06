require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const requireAuth = require("./middleware/requireAuth");

// Cache the client on `global` so repeated invocations of the same warm
// serverless instance reuse one connection instead of opening a new one each time.
const prisma = global.__beaubookPrisma || new PrismaClient();
global.__beaubookPrisma = prisma;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth")(prisma, requireAuth));

app.use("/api/bookings", require("./routes/bookings")(prisma, requireAuth));
app.use("/api/staff", require("./routes/staff")(prisma, requireAuth));
app.use("/api/leave", require("./routes/leave")(prisma, requireAuth));
app.use("/api/schedules", require("./routes/schedules")(prisma, requireAuth));
app.use("/api/customers", require("./routes/customers")(prisma, requireAuth));
app.use("/api/closed-dates", require("./routes/closedDates")(prisma, requireAuth));
app.use("/api/open-overrides", require("./routes/openOverrides")(prisma, requireAuth));
app.use("/api/closed-weekdays", require("./routes/closedWeekdays")(prisma, requireAuth));
app.use("/api/services", require("./routes/services")(prisma, requireAuth));
app.use("/api/products", require("./routes/products")(prisma, requireAuth));
app.use("/api/settings", require("./routes/settings")(prisma, requireAuth));

module.exports = app;
