ALTER TABLE "Product"
  ADD COLUMN "allowedPaymentMethods" TEXT[] NOT NULL DEFAULT ARRAY['upi']::TEXT[];
