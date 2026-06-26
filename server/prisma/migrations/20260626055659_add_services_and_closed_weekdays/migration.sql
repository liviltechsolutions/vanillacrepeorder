-- CreateTable
CREATE TABLE "ClosedWeekday" (
    "weekday" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "ClosedWeekday_pkey" PRIMARY KEY ("weekday")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
