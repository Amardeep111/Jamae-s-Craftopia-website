ALTER TYPE "OrderStatus" ADD VALUE 'RETURN_REQUESTED';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURN_APPROVED';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURN_IN_TRANSIT';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';
ALTER TYPE "OrderStatus" ADD VALUE 'REFUND_REQUESTED';

ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_REQUESTED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_APPROVED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_PROCESSING';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_REJECTED';
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "refundUpiId" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RefundRequest_orderId_status_idx" ON "RefundRequest"("orderId", "status");
CREATE INDEX "RefundRequest_status_createdAt_idx" ON "RefundRequest"("status", "createdAt");
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
