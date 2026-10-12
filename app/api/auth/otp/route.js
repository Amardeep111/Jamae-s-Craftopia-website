import { NextResponse } from 'next/server'

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

    // A real OTP service would send an SMS/email here and return a session/reference token.
    return NextResponse.json(
      {
        success: true,
        message: 'OTP request processed.',
        data: { reference: 'placeholder-otp-ref' },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth OTP request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process OTP request' },
      { status: 500 }
    )
  }
}
