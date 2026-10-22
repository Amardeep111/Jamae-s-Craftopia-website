import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { products } from '../app/data/products.js'
import { shopCategories } from '../app/data/categories.js'

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The local seed script is disabled in production.')
  }

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

  for (const product of products) {
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

  for (const coupon of [
    { code: 'CRAFT10', label: '10% off', discountPercent: 10 },
    { code: 'WELCOME15', label: '15% off', discountPercent: 15 },
    { code: 'FIRSTORDER', label: '20% off', discountPercent: 20 },
  ]) {
    await prisma.coupon.upsert({ where: { code: coupon.code }, create: coupon, update: coupon })
  }

  const password = await bcrypt.hash('Test@123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    create: {
      id: 'local-test-user',
      email: 'test@example.com',
      password,
      name: 'Test User',
      phone: '9876543210',
    },
    update: {},
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: {
      id: 'local-test-admin',
      email: 'admin@example.com',
      password,
      name: 'Local Admin',
      phone: '9876543211',
      role: 'SUPERADMIN',
    },
    update: { role: 'SUPERADMIN', adminActive: true },
  })

  await prisma.storeSetting.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      merchantName: "Jamae's Craftopia",
      merchantVpa: 'business@upi',
      whatsappNumber: '919876543210',
    },
    update: {
      merchantName: "Jamae's Craftopia",
    },
  })

  console.log(`Seeded ${shopCategories.length} categories and ${products.length} products.`)
  console.log(`Local test account: ${testUser.email} / Test@123`)
  console.log(`Local admin account: ${adminUser.email} / Test@123`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
