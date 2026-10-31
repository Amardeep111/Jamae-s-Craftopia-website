import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  // Password-protected so only you can access it
  if (key !== 'reveal_craftopia_keys_9988') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const keys = {
    GMAIL_USER: process.env.GMAIL_USER || null,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || null,
    EMAIL_FROM: process.env.EMAIL_FROM || null,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || null,
    MERCHANT_UPI_ID: process.env.MERCHANT_UPI_ID || null,
    MERCHANT_PAYEE_NAME: process.env.MERCHANT_PAYEE_NAME || null,
    WHATSAPP_CONTACT_NUMBER: process.env.WHATSAPP_CONTACT_NUMBER || null,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || null,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || null,
    DATABASE_URL: process.env.DATABASE_URL || null,
    DIRECT_URL: process.env.DIRECT_URL || null,
    AUTH_SECRET: process.env.AUTH_SECRET || null,
  }

  console.log('=== VERCEL DECRYPTED SECRETS ===\n', JSON.stringify(keys, null, 2))

  return NextResponse.json(keys)
}

