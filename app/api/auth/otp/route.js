import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { randomInt } from 'node:crypto'
import { hashEmailOtp } from '@/lib/auth/email-otp'
import { enforceAuthRateLimit } from '@/lib/auth/rate-limit'
import { sendSignupVerificationEmail } from '@/lib/notification/email'

// Placeholder OTP backend endpoint.
// Provides a structured entry point for connecting a real OTP service later.
// No fake authentication success or hardcoded secrets.

const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
const mobileRe = /^\+?\d{10,15}$/

function isValidEmail(v) {
  return emailRe.test(String(v).trim())
}
function isValidMobile(v) {
  const digits = String(v).replace(/[\s\-().]/g, '')
  return mobileRe.test(digits) && digits.replace(/\D/g, '').length >= 10
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (typeof body?.challengeId === 'string') {
      const rateLimit = await enforceAuthRateLimit(request, { scope: 'otp-resend', identity: body.challengeId, ipLimit: 20, identityLimit: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 })
      if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many code requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })
      const challenge = await prisma.emailVerification.findUnique({ where: { id: body.challengeId } })
      if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
        return NextResponse.json({ success: false, error: 'This signup has expired. Please start again.' }, { status: 410 })
      }
      if (challenge.resends >= 3) return NextResponse.json({ success: false, error: 'You have reached the resend limit. Please start signup again.' }, { status: 429 })
      if (Date.now() - challenge.updatedAt.getTime() < 30_000) return NextResponse.json({ success: false, error: 'Please wait before requesting another code.' }, { status: 429 })
      const code = process.env.PLAYWRIGHT_TEST === 'true' && /^\d{6}$/.test(process.env.EMAIL_OTP_TEST_CODE || '')
        ? process.env.EMAIL_OTP_TEST_CODE
        : String(randomInt(0, 1_000_000)).padStart(6, '0')
      const codeHash = hashEmailOtp(challenge.email, code)
      await sendSignupVerificationEmail(challenge.email, code)
      await prisma.emailVerification.update({ where: { id: challenge.id }, data: { codeHash, attempts: 0, resends: { increment: 1 }, expiresAt: new Date(Date.now() + 10 * 60 * 1000) } })
      return NextResponse.json({ success: true })
    }
    const { emailOrMobile } = body || {}

    if (!emailOrMobile || typeof emailOrMobile !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email or mobile number' },
        { status: 400 }
      )
    }

    const trimmed = emailOrMobile.trim()
    if (!trimmed) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email or mobile number' },
        { status: 400 }
      )
    }

    if (!isValidEmail(trimmed) && !isValidMobile(trimmed)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email or mobile number' },
        { status: 400 }
      )
    }

    const rateLimit = await enforceAuthRateLimit(request, { scope: 'otp-login', identity: trimmed, ipLimit: 10, identityLimit: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 })
    if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many code requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })

    // Internal DB check — BLOCK OTP if user does not exist
    try {
      if (prisma) {
        const normalized = trimmed.toLowerCase()
        const digits = trimmed.replace(/\D/g, '')
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: normalized }, { phone: digits }] }
        })
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'No account found with this email or mobile. Please sign up first.' },
            { status: 404 }
          )
        }
      }
    } catch {
      // DB unavailable — do not proceed with OTP if DB is down
      return NextResponse.json(
        { success: false, error: 'Authentication service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'One-time-code sign-in is not available yet. Please use password sign-in.',
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Auth OTP request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process OTP request' },
      { status: 500 }
    )
  }
}
