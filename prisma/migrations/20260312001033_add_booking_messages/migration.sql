-- CreateTable
CREATE TABLE "BookingMessage" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "senderRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingMessage_bookingId_idx" ON "BookingMessage"("bookingId");

-- CreateIndex
CREATE INDEX "BookingMessage_createdAt_idx" ON "BookingMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "BookingMessage" ADD CONSTRAINT "BookingMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
