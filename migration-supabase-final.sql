-- Jamaes Craftopia complete Supabase schema bootstrap.
-- Run once against a new/empty Supabase PostgreSQL database using the SQL Editor.
-- This bundles the checked-in Prisma migrations in chronological order.
-- Manual execution does not record entries in Prisma migration history.
-- For future Prisma migrations, first baseline these migrations as applied, or
-- use npm run db:migrate:deploy on a fresh database instead of this file.

-- ============================================================================
-- Source migration: 20261018_init
-- ============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AWAITING_VERIFICATION', 'PAID', 'COD_PENDING_COLLECTION', 'COD_COLLECTED', 'FAILED', 'EXPIRED', 'CANCELLED', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "accent" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "short" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "materials" TEXT,
    "care" TEXT,
    "customization" TEXT,
    "visual" TEXT,
    "palette" JSONB,
    "images" JSONB,
    "imageUrl" TEXT,
    "cloudinaryPublicId" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" JSONB,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "idempotencyKey" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "shipping" INTEGER NOT NULL DEFAULT 0,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "trackingNumber" TEXT,
    "shippingPartner" TEXT,
    "estimatedDelivery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "customization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "category" TEXT,
    "colors" TEXT,
    "budget" TEXT,
    "occasion" TEXT,
    "details" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "houseFlatBuilding" TEXT NOT NULL,
    "areaStreet" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "addressType" TEXT NOT NULL DEFAULT 'home',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resends" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "minSubtotal" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "provider" TEXT,
    "providerReference" TEXT,
    "method" TEXT,
    "utr" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_featured_idx" ON "Product"("featured");

-- CreateIndex
CREATE INDEX "Product_published_idx" ON "Product"("published");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Order_status_paymentStatus_idx" ON "Order"("status", "paymentStatus");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Order_totalAmount_idx" ON "Order"("totalAmount");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_quantity_idx" ON "OrderItem"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_productId_key" ON "OrderItem"("orderId", "productId");

-- CreateIndex
CREATE INDEX "CustomRequest_status_idx" ON "CustomRequest"("status");

-- CreateIndex
CREATE INDEX "CustomRequest_createdAt_idx" ON "CustomRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_read_idx" ON "ContactMessage"("read");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Address_userId_isDefault_idx" ON "Address"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_email_expiresAt_idx" ON "EmailVerification"("email", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_active_expiresAt_idx" ON "Coupon"("active", "expiresAt");

-- CreateIndex
CREATE INDEX "PaymentLog_orderId_idx" ON "PaymentLog"("orderId");

-- CreateIndex
CREATE INDEX "PaymentLog_status_idx" ON "PaymentLog"("status");

-- CreateIndex
CREATE INDEX "PaymentLog_providerReference_idx" ON "PaymentLog"("providerReference");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Source migration: 20261019110000_admin_rbac_revocable_sessions
-- ============================================================================

ALTER TABLE "User"
ADD COLUMN "adminPermissions" JSONB,
ADD COLUMN "adminActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Session"
ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");

-- ============================================================================
-- Source migration: 20261019130000_deployment_schema_completion
-- ============================================================================

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
  "aboutContent" JSONB,
  "siteContent" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- Source migration: 20261019140000_customer_account_activation
-- ============================================================================

ALTER TABLE "User"
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- ============================================================================
-- Source migration: 20261019150000_product_location_availability
-- ============================================================================

ALTER TABLE "Product"
  ADD COLUMN "unavailableStates" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "unavailablePinCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- ============================================================================
-- Source migration: 20261019160000_database_cart
-- ============================================================================

CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey"
  FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Source migration: 20261019170000_product_payment_methods
-- ============================================================================

ALTER TABLE "Product"
  ADD COLUMN "allowedPaymentMethods" TEXT[] NOT NULL DEFAULT ARRAY['upi']::TEXT[];

-- ============================================================================
-- Source migration: 20261019180000_customer_reviews
-- ============================================================================

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productRating" INTEGER NOT NULL,
    "deliveryRating" INTEGER NOT NULL,
    "packagingRating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");
CREATE INDEX "Review_productId_createdAt_idx" ON "Review"("productId", "createdAt");
CREATE INDEX "Review_orderId_idx" ON "Review"("orderId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Source migration: 20261019_refund_workflow
-- ============================================================================

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

ALTER TABLE "Product"
ADD COLUMN "availableForSale" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "CustomRequest"
ADD COLUMN "referenceImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "CustomRequest" ADD COLUMN "userId" TEXT;
CREATE INDEX "CustomRequest_userId_idx" ON "CustomRequest"("userId");
ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomRequest" ADD COLUMN "quotedPrice" INTEGER;
