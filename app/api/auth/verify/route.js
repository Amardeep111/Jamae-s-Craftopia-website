import { NextResponse } from 'next/server'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/db/client'
import { hashEmailOtp } from '@/lib/auth/email-otp'
import { enforceAuthRateLimit } from '@/lib/auth/rate-limit'
import { encryptSessionCookie } from '@/lib/auth/session'

export async function POST(request) {
  try {
    const { challengeId, otp } = await request.json()
    const code = typeof otp === 'string' ? otp.replace(/\D/g, '') : ''
    if (typeof challengeId !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, error: 'Enter the six-digit email verification code.' }, { status: 400 })
    }

    const rateLimit = await enforceAuthRateLimit(request, { scope: 'signup-verify', identity: challengeId, ipLimit: 30, identityLimit: 10, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 })
    if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many verification attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })

    const challenge = await prisma.emailVerification.findUnique({ where: { id: challengeId } })
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
      return NextResponse.json({ success: false, error: 'This verification code expired. Start signup again.' }, { status: 410 })
    }
    if (challenge.attempts >= 5) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Start signup again.' }, { status: 429 })
    }

    const expected = Buffer.from(challenge.codeHash, 'hex')
    const received = Buffer.from(hashEmailOtp(challenge.email, code), 'hex')
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      await prisma.emailVerification.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } })
      return NextResponse.json({ success: false, error: 'Incorrect verification code. Please try again.' }, { status: 400 })
    }

    const payload = challenge.payload
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.emailVerification.updateMany({ where: { id: challenge.id, consumedAt: null }, data: { consumedAt: new Date() } })
      if (!claimed.count) throw new Error('This verification code has already been used.')
      const user = await tx.user.create({
        data: { email: challenge.email, name: payload.name, phone: payload.mobile, password: payload.passwordHash },
      })
      await tx.session.create({ data: { userId: user.id, token, expiresAt } })
      return user
    })

    const response = NextResponse.json({
      success: true,
      data: { user: { id: result.id, email: result.email, name: result.name, role: result.role } },
    })
    response.cookies.set('jamaes_session', encryptSessionCookie(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Email verification failed:', error)
    return NextResponse.json({ success: false, error: 'Could not verify your email. Please try again.' }, { status: 500 })
  }
}
