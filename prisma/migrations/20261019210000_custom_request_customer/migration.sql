ALTER TABLE "CustomRequest" ADD COLUMN "userId" TEXT;
CREATE INDEX "CustomRequest_userId_idx" ON "CustomRequest"("userId");
ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomRequest" ADD COLUMN "quotedPrice" INTEGER;
