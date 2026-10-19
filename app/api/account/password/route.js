import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { hashPassword, validatePassword, verifyPassword } from '@/lib/auth/password'
import { decryptPassword } from '@/lib/auth/password-encryption'
import { prisma } from '@/lib/db/client'
import { randomInt } from 'node:crypto'
import { hashEmailOtp } from '@/lib/auth/email-otp'
import { sendEmail } from '@/lib/notification/email'

export const runtime = 'nodejs'

export async function POST(request) {
  const session = await verifySession(request.cookies.get('jamaes_session')?.value)
  if (!session?.user) return NextResponse.json({ success: false, error: 'Please sign in again to change your password.' }, { status: 401 })
  try {
    const body = await request.json()
    let currentPassword, newPassword
    try {
      currentPassword = decryptPassword(body.currentPassword)
      newPassword = decryptPassword(body.newPassword)
    } catch {
      return NextResponse.json({ success: false, error: 'Could not securely process the password. Please try again.' }, { status: 400 })
    }
    if (!await verifyPassword(currentPassword, session.user.password)) return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 })
    const errors = validatePassword(newPassword)
    if (errors.length) return NextResponse.json({ success: false, error: errors[0] }, { status: 400 })
    if (await verifyPassword(newPassword, session.user.password)) return NextResponse.json({ success: false, error: 'Choose a password different from your current one.' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, name: true } })
    if (!user) return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 })
    const code = process.env.PLAYWRIGHT_TEST === 'true' && /^\d{6}$/.test(process.env.EMAIL_OTP_TEST_CODE || '')
      ? process.env.EMAIL_OTP_TEST_CODE
      : String(randomInt(0, 1_000_000)).padStart(6, '0')
    const challenge = await prisma.emailVerification.create({
      data: {
        email: user.email,
        codeHash: hashEmailOtp(user.email, code),
        payload: { purpose: 'password-change', userId: user.id, passwordHash: await hashPassword(newPassword) },
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
    try {
      if (process.env.PLAYWRIGHT_TEST === 'true' && code === process.env.EMAIL_OTP_TEST_CODE) {
        console.info(`[test-password-otp] ${user.email}: ${code}`)
      } else {
        await sendEmail({
          to: user.email,
          subject: "Confirm your Jamae's Craftopia password change",
          text: `Your password change verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this message and keep your current password.`,
          html: `<div style="font-family:Arial,sans-serif;color:#503947;line-height:1.6"><h1>Confirm your password change</h1><p>Enter this code to finish updating your password:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request this, ignore this message and keep your current password.</p></div>`,
        })
      }
    } catch (error) {
      await prisma.emailVerification.delete({ where: { id: challenge.id } })
      console.error('Password change verification email failed:', error.message)
      return NextResponse.json({ success: false, error: 'We could not send the verification code. Your password has not changed. Please try again later.' }, { status: 503 })
    }
    return NextResponse.json({ success: true, challengeId: challenge.id, message: `A verification code was sent to ${user.email}. Your password will change after you verify it.` }, { status: 202 })
  } catch (error) {
    console.error('Password change failed:', error)
    return NextResponse.json({ success: false, error: 'Could not update your password. Please try again.' }, { status: 500 })
  }
}
