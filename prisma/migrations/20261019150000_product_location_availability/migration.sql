ALTER TABLE "Product"
  ADD COLUMN "unavailableStates" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "unavailablePinCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
