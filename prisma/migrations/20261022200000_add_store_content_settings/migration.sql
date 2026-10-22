-- AlterTable
ALTER TABLE "StoreSetting" ADD COLUMN IF NOT EXISTS "aboutContent" JSONB;
ALTER TABLE "StoreSetting" ADD COLUMN IF NOT EXISTS "siteContent" JSONB;

