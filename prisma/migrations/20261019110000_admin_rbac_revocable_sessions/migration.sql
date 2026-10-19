ALTER TABLE "User"
ADD COLUMN "adminPermissions" JSONB,
ADD COLUMN "adminActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Session"
ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");
