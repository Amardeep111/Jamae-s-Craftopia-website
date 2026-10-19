import { NextResponse } from 'next/server'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/db/client'
import { verifySession, encryptSessionCookie } from '@/lib/auth/session'
import { hashEmailOtp } from '@/lib/auth/email-otp'
import { enforceAuthRateLimit } from '@/lib/auth/rate-limit'
import { sendEmailBestEffort, sendPasswordChangedEmail } from '@/lib/notification/email'

export const runtime = 'nodejs'

export async function POST(request) {
  const session = await verifySession(request.cookies.get('jamaes_session')?.value)
  if (!session?.user) return NextResponse.json({ success: false, error: 'Please sign in again to verify this change.' }, { status: 401 })
  try {
    const { challengeId, otp } = await request.json()
    const code = typeof otp === 'string' ? otp.replace(/\D/g, '') : ''
    if (typeof challengeId !== 'string' || !/^\d{6}$/.test(code)) return NextResponse.json({ success: false, error: 'Enter the six-digit email verification code.' }, { status: 400 })
    const rateLimit = await enforceAuthRateLimit(request, { scope: 'password-change-verify', identity: challengeId, ipLimit: 20, identityLimit: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 })
    if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many verification attempts. Request a new code later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })

    const challenge = await prisma.emailVerification.findUnique({ where: { id: challengeId } })
    const payload = challenge?.payload
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date() || payload?.purpose !== 'password-change' || payload?.userId !== session.user.id || challenge.email !== session.user.email) {
      return NextResponse.json({ success: false, error: 'This verification code expired or is no longer valid. Start the password change again.' }, { status: 410 })
    }
    if (challenge.attempts >= 5) return NextResponse.json({ success: false, error: 'Too many attempts. Start the password change again.' }, { status: 429 })
    const expected = Buffer.from(challenge.codeHash, 'hex')
    const received = Buffer.from(hashEmailOtp(challenge.email, code), 'hex')
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      await prisma.emailVerification.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } })
      return NextResponse.json({ success: false, error: 'Incorrect verification code. Please try again.' }, { status: 400 })
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.emailVerification.updateMany({ where: { id: challenge.id, consumedAt: null }, data: { consumedAt: new Date() } })
      if (!claimed.count) throw new Error('This verification code has already been used.')
      await tx.user.update({ where: { id: session.user.id }, data: { password: payload.passwordHash } })
      await tx.session.updateMany({ where: { userId: session.user.id, revokedAt: null }, data: { revokedAt: new Date() } })
      await tx.session.create({ data: { userId: session.user.id, token, expiresAt } })
    })
    await sendEmailBestEffort(() => sendPasswordChangedEmail(session.user.email, session.user.name), 'password-changed')
    const response = NextResponse.json({ success: true, message: 'Password updated. Other active sessions have been signed out.' })
    response.cookies.set('jamaes_session', encryptSessionCookie(token), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch (error) {
    console.error('Password verification failed:', error)
    return NextResponse.json({ success: false, error: 'Could not verify the password change. Please try again.' }, { status: 500 })
  }
}
