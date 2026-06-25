const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const INIT_STAFF = [
  { id: 1, name: "Amirah", avatar: "A", color: "#a855f7", photo: null, phone: "012-9988776", emergencyName: "Fatimah (Mother)", emergencyPhone: "017-1122334", position: "Senior Beautician", skills: ["Haircut", "Colouring", "Treatment"], ic: "900101-14-1234" },
  { id: 2, name: "Siti", avatar: "S", color: "#ec4899", photo: null, phone: "013-7765432", emergencyName: "Ahmad (Husband)", emergencyPhone: "011-3344556", position: "Nail Technician", skills: ["Manicure", "Pedicure", "Facial"], ic: "930615-10-5678" },
  { id: 3, name: "Mei Ling", avatar: "M", color: "#06b6d4", photo: null, phone: "016-5543210", emergencyName: "Chong Wai (Father)", emergencyPhone: "012-8899001", position: "Lead Stylist", skills: ["Haircut", "Colouring", "Threading", "Facial"], ic: "950320-07-9012" },
];

const INIT_CUSTOMERS_DATA = {
  "012-3456789": { ic: "900505-14-1234", email: "nurul@email.com", gender: "F", birthday: "1990-05-05" },
  "017-9988776": { ic: "880101-10-5678", email: "lina@email.com", gender: "F", birthday: "1988-01-01" },
  "012-1122334": { ic: "920303-07-9012", email: "amy@email.com", gender: "F", birthday: "1992-03-03" },
};

const INIT_BK = [
  { id: 1, customer: "Nurul Ain", phone: "012-3456789", service: 1, staff: 1, date: "2026-06-22", time: "09:00", status: "confirmed", note: "Sensitive scalp", remark: "Prefer rose scent", payStatus: "paid", payMethod: "fpx", amtPaid: 80, txnId: "TXN001", seat: "Seat A1", history: [] },
  { id: 2, customer: "Rachel Tan", phone: "016-7891234", service: 2, staff: 2, date: "2026-06-22", time: "10:00", status: "confirmed", note: "First timer", remark: "", payStatus: "partial", payMethod: "grabpay", amtPaid: 100, txnId: "TXN002", seat: "Room 1", history: [] },
  { id: 3, customer: "Priya K.", phone: "011-2233445", service: 5, staff: 3, date: "2026-06-22", time: "11:30", status: "pending", note: "", remark: "No fragrance", payStatus: "unpaid", payMethod: "", amtPaid: 0, txnId: "", seat: "", history: [] },
  { id: 4, customer: "Lina Hassan", phone: "017-9988776", service: 3, staff: 1, date: "2026-06-22", time: "14:00", status: "confirmed", note: "Allergic to ammonia", remark: "", payStatus: "partial", payMethod: "cash", amtPaid: 60, txnId: "", seat: "Seat B1", history: [] },
  { id: 5, customer: "Jenny Chong", phone: "019-5544332", service: 6, staff: 2, date: "2026-06-22", time: "15:30", status: "confirmed", note: "", remark: "", payStatus: "paid", payMethod: "tng", amtPaid: 30, txnId: "TXN005", seat: "Seat A2", history: [] },
  { id: 6, customer: "Farah Nadia", phone: "013-6677889", service: 1, staff: 3, date: "2026-06-28", time: "10:00", status: "confirmed", note: "", remark: "", payStatus: "paid", payMethod: "tng", amtPaid: 80, txnId: "TXN006", seat: "", history: [] },
  { id: 7, customer: "Amy Loh", phone: "012-1122334", service: 2, staff: 1, date: "2026-06-28", time: "13:00", status: "confirmed", note: "", remark: "Color: ash brown", payStatus: "unpaid", payMethod: "duitnow", amtPaid: 0, txnId: "", seat: "Room 2", history: [] },
  { id: 8, customer: "Suraya M.", phone: "018-4455667", service: 5, staff: 2, date: "2026-06-30", time: "09:30", status: "pending", note: "", remark: "", payStatus: "unpaid", payMethod: "", amtPaid: 0, txnId: "", seat: "", history: [] },
  { id: 9, customer: "Nurul Ain", phone: "012-3456789", service: 2, staff: 1, date: "2026-05-20", time: "10:00", status: "confirmed", note: "", remark: "", payStatus: "paid", payMethod: "fpx", amtPaid: 180, txnId: "TXN009", seat: "Room 1", history: [] },
  { id: 10, customer: "Nurul Ain", phone: "012-3456789", service: 3, staff: 1, date: "2026-04-10", time: "11:00", status: "confirmed", note: "", remark: "", payStatus: "paid", payMethod: "fpx", amtPaid: 120, txnId: "TXN010", seat: "", history: [] },
  { id: 11, customer: "Lina Hassan", phone: "017-9988776", service: 1, staff: 1, date: "2026-05-15", time: "14:00", status: "confirmed", note: "", remark: "", payStatus: "paid", payMethod: "cash", amtPaid: 80, txnId: "", seat: "", history: [] },
  { id: 12, customer: "Amy Loh", phone: "012-1122334", service: 4, staff: 2, date: "2026-05-30", time: "11:00", status: "confirmed", note: "", remark: "", payStatus: "paid", payMethod: "grabpay", amtPaid: 50, txnId: "TXN012", seat: "", history: [] },
];

async function main() {
  await prisma.booking.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customerExtra.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.leaveRecord.deleteMany();
  await prisma.schedule.deleteMany();

  for (const s of INIT_STAFF) {
    await prisma.staff.create({ data: s });
  }
  for (const b of INIT_BK) {
    await prisma.booking.create({ data: b });
  }
  for (const [phone, extra] of Object.entries(INIT_CUSTOMERS_DATA)) {
    await prisma.customerExtra.create({ data: { phone, ...extra } });
  }

  // explicit ids above don't advance the autoincrement sequences — fix that up
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Staff"', 'id'), (SELECT MAX(id) FROM "Staff"))`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Booking"', 'id'), (SELECT MAX(id) FROM "Booking"))`
  );

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
