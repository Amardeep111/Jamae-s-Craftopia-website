-- Create indexes for Product table (post-raw-apply, mapped to Schema)
CREATE INDEX IF NOT EXISTS "idx_product_category_id" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_product_featured" ON "Product"("featured");
CREATE INDEX IF NOT EXISTS "idx_product_published" ON "Product"("published");
CREATE INDEX IF NOT EXISTS "idx_product_cfp" ON "Product"("categoryId", "featured", "published");
CREATE INDEX IF NOT EXISTS "idx_product_name_short" ON "Product"("name", "short");
