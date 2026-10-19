import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getSuperAdminSession } from '@/lib/auth/admin'
import { decryptPassword } from '@/lib/auth/password-encryption'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { invalidateAllSessions } from '@/lib/auth/session'
import { sendEmailBestEffort } from '@/lib/notification/email'

export const runtime = 'nodejs'

export async function POST(request) {
  const session = await getSuperAdminSession(request.cookies.get('jamaes_session')?.value)
  if (!session) return NextResponse.json({ success: false, error: 'Only a superadmin can reset administrator passwords.' }, { status: 403 })
  try {
    const body = await request.json()
    if (typeof body.userId !== 'string') return NextResponse.json({ success: false, error: 'Choose an administrator account.' }, { status: 400 })
    const target = await prisma.user.findUnique({ where: { id: body.userId }, select: { id: true, role: true, email: true } })
    if (!target || target.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Administrator account not found.' }, { status: 404 })
    let password
    try { password = decryptPassword(body.encryptedPassword) } catch {
      return NextResponse.json({ success: false, error: 'Could not securely process the new password. Please retry.' }, { status: 400 })
    }
    const errors = validatePassword(password)
    if (errors.length) return NextResponse.json({ success: false, error: errors[0] }, { status: 400 })
    await prisma.user.update({ where: { id: target.id }, data: { password: await hashPassword(password) } })
    await invalidateAllSessions(target.id)
    await sendEmailBestEffort({ to: target.email, subject: "Your Jamae's Craftopia administrator password was reset", text: 'A superadmin reset your administrator password. All existing sessions were signed out. If you did not expect this change, contact your store owner.' }, 'admin-password-reset')
    return NextResponse.json({ success: true, message: `Password updated for ${target.email}. All existing sessions were signed out.` })
  } catch (error) {
    console.error('Admin password reset failed:', error)
    return NextResponse.json({ success: false, error: 'Could not reset the administrator password.' }, { status: 500 })
  }
}
