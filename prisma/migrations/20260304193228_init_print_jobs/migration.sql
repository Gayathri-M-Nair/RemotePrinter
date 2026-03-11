-- CreateEnum
CREATE TYPE "PrintStatus" AS ENUM ('PENDING', 'IN_QUEUE', 'PRINTING', 'COMPLETED', 'COLLECTED');

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL,
    "sheetsRequired" INTEGER NOT NULL,
    "printType" TEXT NOT NULL,
    "colorMode" TEXT NOT NULL,
    "pagesPerSheet" INTEGER NOT NULL,
    "copies" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "queuePosition" INTEGER NOT NULL,
    "printerLocation" TEXT NOT NULL,
    "status" "PrintStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrintJob_tokenNumber_key" ON "PrintJob"("tokenNumber");

-- CreateIndex
CREATE INDEX "PrintJob_status_idx" ON "PrintJob"("status");

-- CreateIndex
CREATE INDEX "PrintJob_userId_idx" ON "PrintJob"("userId");

-- CreateIndex
CREATE INDEX "PrintJob_tokenNumber_idx" ON "PrintJob"("tokenNumber");

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
