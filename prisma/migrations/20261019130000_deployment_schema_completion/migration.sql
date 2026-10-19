-- Bring the deployed schema in line with prisma/schema.prisma.
-- The original migration set predates per-product fees and database-backed throttling.

ALTER TABLE "Product"
  ADD COLUMN "gstPercent" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "codFee" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "otherCharge" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "OrderItem"
  ADD COLUMN "gstPercent" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "gstAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "codFee" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "otherCharge" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "AuthRateLimit" (
  "key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "AuthRateLimit_blockedUntil_idx" ON "AuthRateLimit"("blockedUntil");
CREATE INDEX "AuthRateLimit_updatedAt_idx" ON "AuthRateLimit"("updatedAt");

CREATE TABLE "StoreSetting" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "merchantVpa" TEXT,
  "merchantName" TEXT NOT NULL DEFAULT 'Jamae''s Craftopia',
  "whatsappNumber" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);
