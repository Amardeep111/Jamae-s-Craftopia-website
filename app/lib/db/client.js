// Reuse the Prisma client in development; each Vercel function instance owns
// one client and uses Supabase's transaction pooler in production.
import { PrismaClient } from '@prisma/client'

let prismaInstance = null

const globalForPrisma = globalThis
prismaInstance = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance

export const prisma = prismaInstance

export function shouldUseMockData() {
  if (process.env.NODE_ENV === 'production' && process.env.USE_MOCK_DATA === 'true') {
    throw new Error('Mock data mode must not be enabled in production.')
  }
  return process.env.USE_MOCK_DATA === 'true'
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
