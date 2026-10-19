import { PrismaClient } from '@prisma/client'
import { hashPassword, validatePassword } from '../app/lib/auth/password.js'

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!databaseUrl) throw new Error('Set DIRECT_URL or DATABASE_URL to the Supabase database URL.')
if (!email || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Set a valid BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD.')
}
const passwordErrors = validatePassword(password)
if (passwordErrors.length) throw new Error(`The bootstrap password is too weak: ${passwordErrors.join(' ')}`)

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })

async function main() {
  const superadminCount = await prisma.user.count({ where: { role: 'SUPERADMIN' } })
  if (superadminCount > 0) throw new Error('A superadmin already exists. Use the admin panel to manage administrators.')

  const passwordHash = await hashPassword(password)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.role !== 'CUSTOMER') {
    throw new Error('This email already has administrator access; bootstrap was stopped.')
  }

  const admin = await prisma.$transaction(async (tx) => {
    const account = existing
      ? await tx.user.update({ where: { id: existing.id }, data: { password: passwordHash, role: 'SUPERADMIN', adminPermissions: null, adminActive: true } })
      : await tx.user.create({ data: { email, password: passwordHash, role: 'SUPERADMIN', adminActive: true } })
    if (existing) await tx.session.updateMany({ where: { userId: existing.id, revokedAt: null }, data: { revokedAt: new Date() } })
    return account
  })

  console.log(`Superadmin access provisioned for ${admin.email}. Remove the bootstrap environment variables after this run.`)
}

main()
  .catch((error) => {
    console.error('Superadmin bootstrap failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
