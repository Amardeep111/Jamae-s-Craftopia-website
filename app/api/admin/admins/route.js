import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getSuperAdminSession, ADMIN_PERMISSIONS } from '@/lib/auth/admin'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { invalidateAllSessions } from '@/lib/auth/session'
import { decryptPassword } from '@/lib/auth/password-encryption'
import { sendEmailBestEffort } from '@/lib/notification/email'
import { getAppUrl } from '@/lib/app-url'

export const runtime = 'nodejs'

async function requireSuperadmin(request) {
  return getSuperAdminSession(request.cookies.get('jamaes_session')?.value)
}

function normalizePermissions(value) {
  if (!Array.isArray(value) || value.some((permission) => typeof permission !== 'string' || !ADMIN_PERMISSIONS.has(permission))) return null
  return [...new Set(value)]
}

export async function GET(request) {
  const session = await requireSuperadmin(request)
  if (!session) return NextResponse.json({ success: false, error: 'Only a superadmin can manage administrator accounts.' }, { status: 403 })
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
      select: { id: true, name: true, email: true, role: true, adminPermissions: true, adminActive: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data: admins })
  } catch (error) {
    console.error('Admin access list failed:', error)
    return NextResponse.json({ success: false, error: 'Could not load administrator accounts.' }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await requireSuperadmin(request)
  if (!session) return NextResponse.json({ success: false, error: 'Only a superadmin can create administrator accounts.' }, { status: 403 })
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const permissions = normalizePermissions(body.permissions)
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
    if (!emailPattern.test(email) || !name || name.length > 100 || !permissions) {
      return NextResponse.json({ success: false, error: 'Enter a valid name, email, and permission set.' }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.role !== 'CUSTOMER') {
      return NextResponse.json({ success: false, error: 'That email already belongs to an administrator.' }, { status: 409 })
    }

    let admin
    if (existing) {
      admin = await prisma.user.update({ where: { id: existing.id }, data: { name, role: 'ADMIN', adminPermissions: permissions, adminActive: true } })
      await invalidateAllSessions(existing.id)
    } else {
      let plainPassword
      try { plainPassword = decryptPassword(body.encryptedPassword) } catch {
        return NextResponse.json({ success: false, error: 'Could not securely process the initial password. Please retry.' }, { status: 400 })
      }
      const passwordErrors = validatePassword(plainPassword)
      if (passwordErrors.length) return NextResponse.json({ success: false, error: passwordErrors[0] }, { status: 400 })
      const password = await hashPassword(plainPassword)
      admin = await prisma.user.create({ data: { email, name, password, role: 'ADMIN', adminPermissions: permissions, adminActive: true } })
    }
    const { password: _password, ...safeAdmin } = admin
    if (!existing) await sendEmailBestEffort({ to: admin.email, subject: "Your Jamae's Craftopia administrator account is ready", text: `Hello ${admin.name}, a superadmin created an administrator account for you. You can sign in at ${getAppUrl()} using the password provided to you separately.` }, 'admin-account-created')
    return NextResponse.json({ success: true, data: safeAdmin }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Admin account creation failed:', error)
    return NextResponse.json({ success: false, error: 'Could not create administrator account.' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await requireSuperadmin(request)
  if (!session) return NextResponse.json({ success: false, error: 'Only a superadmin can update administrator accounts.' }, { status: 403 })
  try {
    const body = await request.json()
    if (typeof body.userId !== 'string') return NextResponse.json({ success: false, error: 'Administrator account is required.' }, { status: 400 })
    const current = await prisma.user.findUnique({ where: { id: body.userId } })
    if (!current || current.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Administrator not found or cannot be changed.' }, { status: 404 })
    const data = {}
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) return NextResponse.json({ success: false, error: 'Enter a valid administrator name.' }, { status: 400 })
      data.name = body.name.trim()
    }
    if (body.permissions !== undefined) {
      const permissions = normalizePermissions(body.permissions)
      if (!permissions) return NextResponse.json({ success: false, error: 'The permission list contains an unknown permission.' }, { status: 400 })
      data.adminPermissions = permissions
    }
    if (body.active !== undefined) {
      if (typeof body.active !== 'boolean') return NextResponse.json({ success: false, error: 'Active must be true or false.' }, { status: 400 })
      data.adminActive = body.active
    }
    if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'No administrator changes were provided.' }, { status: 400 })
    const updated = await prisma.user.update({ where: { id: current.id }, data })
    if (body.active === false || body.permissions !== undefined) await invalidateAllSessions(current.id)
    const { password: _password, ...safeAdmin } = updated
    return NextResponse.json({ success: true, data: safeAdmin })
  } catch (error) {
    console.error('Admin account update failed:', error)
    return NextResponse.json({ success: false, error: 'Could not update administrator account.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await requireSuperadmin(request)
  if (!session) return NextResponse.json({ success: false, error: 'Only a superadmin can remove administrator access.' }, { status: 403 })
  try {
    const body = await request.json()
    if (typeof body.userId !== 'string' || body.userId === session.user.id) return NextResponse.json({ success: false, error: 'You cannot remove your own administrator access.' }, { status: 400 })
    const current = await prisma.user.findUnique({ where: { id: body.userId } })
    if (!current || current.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Administrator not found or cannot be removed.' }, { status: 404 })
    await prisma.user.update({ where: { id: current.id }, data: { role: 'CUSTOMER', adminPermissions: null, adminActive: true } })
    await invalidateAllSessions(current.id)
    return NextResponse.json({ success: true, message: 'Administrator access removed.' })
  } catch (error) {
    console.error('Admin account removal failed:', error)
    return NextResponse.json({ success: false, error: 'Could not remove administrator access.' }, { status: 500 })
  }
}
