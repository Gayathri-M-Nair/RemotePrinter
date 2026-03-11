/*
  Warnings:

  - Added the required column `printingCost` to the `PrintJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, add columns with default values for existing rows
ALTER TABLE "PrintJob" ADD COLUMN "printingCost" DOUBLE PRECISION;
ALTER TABLE "PrintJob" ADD COLUMN "tokenCharge" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- Update existing rows: set printingCost = totalAmount - 1
UPDATE "PrintJob" SET "printingCost" = "totalAmount" - 1 WHERE "printingCost" IS NULL;

-- Now make printingCost NOT NULL
ALTER TABLE "PrintJob" ALTER COLUMN "printingCost" SET NOT NULL;
