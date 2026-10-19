/**
 * POST /api/auth/login
 * 
 * Authenticates user with email/password and creates a secure session.
 * Implements rate limiting and proper security headers.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifyPassword } from '@/lib/auth/password'
import { createSession, encryptSessionCookie } from '@/lib/auth/session'
import { enforceAuthRateLimit, resetAuthRateLimit } from '@/lib/auth/rate-limit'
import { decryptPassword } from '@/lib/auth/password-encryption'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, encryptedPassword, adminOnly = false } = body || {}

    // Input validation
    if (!email || !encryptedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const rateLimit = await enforceAuthRateLimit(request, {
      scope: 'login', identity: normalizedEmail,
      ipLimit: 30, identityLimit: 8,
      windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000,
    })
    if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many sign-in attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })

    let password
    try { password = decryptPassword(encryptedPassword) } catch {
      return NextResponse.json({ success: false, error: 'Could not securely process your password. Please try again.' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Generic error to prevent enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.password)
    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    if (user.active === false) {
      return NextResponse.json({ success: false, error: 'This account is inactive. Please contact support.' }, { status: 403 })
    }

    if (adminOnly && (!['ADMIN', 'SUPERADMIN'].includes(user.role) || user.adminActive === false)) {
      return NextResponse.json(
        { success: false, error: 'This account does not have administrator access.' },
        { status: 403 }
      )
    }

    await resetAuthRateLimit(request, { scope: 'login', identity: normalizedEmail })

    // Create session
    const { token, expiresAt } = await createSession(user.id)

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    })

    // Set secure session cookie
    response.cookies.set('jamaes_session', encryptSessionCookie(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during login.' },
      { status: 500 }
    )
  }
}
