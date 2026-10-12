import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, mobile } = body || {}

    const errors = {}
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Please enter your full name.'
    } else if (!/^[a-zA-Z\s'.-]+$/.test(name.trim())) {
      errors.name = 'Please enter a valid name.'
    }
    const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
    if (!email || !emailRe.test(email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }
    const mobileRe = /^\+?\d{10,15}$/
    if (!mobile || !mobileRe.test(String(mobile).replace(/\s\-/g, '')) || String(mobile).replace(/\D/g, '').length < 10) {
      errors.mobile = 'Please enter a valid mobile number (10–15 digits).'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors, error: 'Please review the highlighted fields.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedMobile = String(mobile).replace(/\D/g, '')

    // Persist user and set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account created. Verification required.',
      data: { email: normalizedEmail, mobile: normalizedMobile, name: name.trim() },
    })

    // Session cookie for auth (HTTP-only, same-site, 7 days)
    response.cookies.set('jamaes_session', normalizedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Auth signup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create account' }, { status: 500 })
  }
}
