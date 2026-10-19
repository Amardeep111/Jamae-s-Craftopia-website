import { NextResponse } from 'next/server'
import { getPasswordEncryptionPublicKey } from '@/lib/auth/password-encryption'

export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json(getPasswordEncryptionPublicKey(), {
      headers: { 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (error) {
    console.error('Password encryption key unavailable:', error.message)
    return NextResponse.json({ success: false, error: 'Secure password handling is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
