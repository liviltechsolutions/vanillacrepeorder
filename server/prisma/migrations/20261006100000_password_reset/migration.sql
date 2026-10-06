ALTER TABLE "Merchant" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "passwordResetExpires" TIMESTAMP(3);
