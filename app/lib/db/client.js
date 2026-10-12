// Prisma Client wrapper with graceful fallback when not generated
let prismaInstance = null

try {
  const { PrismaClient } = require('@prisma/client')
  const globalForPrisma = globalThis
  prismaInstance = globalForPrisma.prisma || new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance
} catch (e) {
  console.warn('Prisma client not generated. Run "npx prisma generate" if using real database.')
}

export const prisma = prismaInstance

export function shouldUseMockData() {
  return process.env.USE_MOCK_DATA === 'true' || !prismaInstance
}

// Test database connection
export async function testDatabaseConnection() {
  if (!prisma) return false
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.warn('Database connection failed:', error.message)
    return false
  }
}
