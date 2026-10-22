import { PrismaClient } from '@prisma/client'
import { products, catalogSeedProducts } from '../app/data/products.js'
import { shopCategories } from '../app/data/categories.js'

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!databaseUrl) throw new Error('Set DIRECT_URL or DATABASE_URL to the Supabase database URL.')

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })

async function main() {
  const seedProducts = (catalogSeedProducts && catalogSeedProducts.length > 0) ? catalogSeedProducts : products
  for (const [index, category] of shopCategories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        accent: category.accent,
        order: index + 1,
      },
      update: {
        name: category.name,
        description: category.description,
        accent: category.accent,
        order: index + 1,
      },
    })
  }

  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { slug: product.id },
      create: {
        id: product.id,
        slug: product.id,
        name: product.name,
        categoryId: product.category,
        price: product.price,
        featured: product.featured,
        short: product.short,
        description: product.description,
        materials: product.materials,
        care: product.care,
        customization: product.customization,
        visual: product.visual,
        palette: product.palette,
        imageUrl: product.image || product.imageUrl || product.images?.[0] || null,
        images: product.images || (product.image ? [product.image] : []),
        stock: 100,
        published: true,
      },
      update: {
        name: product.name,
        categoryId: product.category,
        price: product.price,
        featured: product.featured,
        short: product.short,
        description: product.description,
        materials: product.materials,
        care: product.care,
        customization: product.customization,
        visual: product.visual,
        palette: product.palette,
        imageUrl: product.image || product.imageUrl || product.images?.[0] || null,
        images: product.images || (product.image ? [product.image] : []),
        published: true,
      },
    })
  }

  console.log(`Seeded ${shopCategories.length} categories and ${products.length} catalog products.`)
}

main()
  .catch((error) => {
    console.error('Catalog seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
