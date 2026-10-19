import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { randomInt } from 'node:crypto'
import { hashEmailOtp } from '@/lib/auth/email-otp'
import { enforceAuthRateLimit } from '@/lib/auth/rate-limit'
import { decryptPassword } from '@/lib/auth/password-encryption'
import { sendSignupVerificationEmail } from '@/lib/notification/email'

export const runtime = 'nodejs'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
  try {
    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const mobile = typeof body?.mobile === 'string' ? body.mobile.replace(/\D/g, '') : ''
    const encryptedPassword = body?.encryptedPassword
    const rateLimit = await enforceAuthRateLimit(request, {
      scope: 'signup-v3', identity: email,
      ipLimit: 100, identityLimit: 3,
      windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000,
    })
    if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many signup requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })
    let password = ''
    try { password = decryptPassword(encryptedPassword) } catch {
      return NextResponse.json({ success: false, errors: { password: 'Could not securely process your password. Please try again.' } }, { status: 400 })
    }
    const errors = {}
    if (name.length < 2 || !/^[a-zA-Z\s'.-]+$/.test(name)) errors.name = 'Please enter a valid full name.'
    if (!emailRe.test(email)) errors.email = 'Please enter a valid email address.'
    if (mobile.length < 10 || mobile.length > 15) errors.mobile = 'Please enter a valid mobile number.'
    const passwordErrors = typeof password === 'string' ? validatePassword(password) : ['Password is required.']
    if (passwordErrors.length) errors.password = passwordErrors.join(' ')
    if (Object.keys(errors).length) return NextResponse.json({ success: false, errors }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 })

    const code = process.env.PLAYWRIGHT_TEST === 'true' && /^\d{6}$/.test(process.env.EMAIL_OTP_TEST_CODE || '')
      ? process.env.EMAIL_OTP_TEST_CODE
      : String(randomInt(0, 1_000_000)).padStart(6, '0')
    const challenge = await prisma.emailVerification.create({
      data: {
        email,
        codeHash: hashEmailOtp(email, code),
        payload: { name, mobile, passwordHash: await hashPassword(password) },
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
    try {
      await sendSignupVerificationEmail(email, code)
    } catch (error) {
      await prisma.emailVerification.delete({ where: { id: challenge.id } })
      throw error
    }
    return NextResponse.json({ success: true, message: 'Verification code sent.', data: { challengeId: challenge.id, email } }, { status: 201 })
  } catch (error) {
    console.error('Signup verification request failed:', error)
    return NextResponse.json({ success: false, error: error.message || 'Could not start signup.' }, { status: 503 })
  }
}
