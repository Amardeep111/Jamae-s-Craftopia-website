ALTER TABLE "CustomRequest"
ADD COLUMN "referenceImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
