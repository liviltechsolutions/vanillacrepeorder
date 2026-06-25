-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "photo" TEXT,
    "phone" TEXT NOT NULL,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "position" TEXT NOT NULL,
    "skills" TEXT[],
    "ic" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "customer" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "service" INTEGER NOT NULL,
    "staff" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "remark" TEXT,
    "payStatus" TEXT NOT NULL,
    "payMethod" TEXT,
    "amtPaid" INTEGER NOT NULL DEFAULT 0,
    "txnId" TEXT,
    "seat" TEXT,
    "history" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRecord" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "dates" TEXT[],
    "leaveType" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "LeaveRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "staffId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("staffId")
);

-- CreateTable
CREATE TABLE "CustomerExtra" (
    "phone" TEXT NOT NULL,
    "ic" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "birthday" TEXT,

    CONSTRAINT "CustomerExtra_pkey" PRIMARY KEY ("phone")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "phone" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("phone")
);
