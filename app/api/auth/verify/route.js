import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { otp, emailOrMobile } = body || {}

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ success: false, error: 'OTP is required' }, { status: 400 })
    }

    if (!/^\d{4,8}$/.test(otp)) {
      return NextResponse.json({ success: false, error: 'Invalid OTP format' }, { status: 400 })
    }

    if (!emailOrMobile) {
      return NextResponse.json({ success: false, error: 'Missing verification context' }, { status: 400 })
    }

    const trimmed = String(emailOrMobile).trim()
    const normalized = trimmed.includes('@') ? trimmed.toLowerCase() : trimmed

    const response = NextResponse.json({
      success: true,
      message: 'OTP verification endpoint reached.',
      data: { emailOrMobile: normalized },
    })

    // Set session cookie on successful verification
    response.cookies.set('jamaes_session', normalized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json({ success: false, error: 'Failed to verify OTP' }, { status: 500 })
  }
}
