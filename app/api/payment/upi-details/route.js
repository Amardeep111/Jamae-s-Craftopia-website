import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

let cachedUpi = null
let cacheExpiresAt = 0

export function invalidateUpiCache() {
  cachedUpi = null
  cacheExpiresAt = 0
}

export async function GET() {
  const now = Date.now()
  if (cachedUpi && now < cacheExpiresAt) {
    return NextResponse.json(
      { success: true, data: cachedUpi },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } }
    )
  }

  let settings = null
  if (prisma?.storeSetting) {
    try {
      // Query ONLY payment-related scalar fields, completely avoiding heavy JSON blobs (siteContent, aboutContent)
      settings = await prisma.storeSetting.findUnique({
        where: { id: 'main' },
        select: { merchantVpa: true, merchantName: true, whatsappNumber: true },
      }) || await prisma.storeSetting.findFirst({
        select: { merchantVpa: true, merchantName: true, whatsappNumber: true },
      })
    } catch (error) {
      console.error('Could not load UPI settings:', error)
      return NextResponse.json({ success: false, error: 'Payment settings are temporarily unavailable.' }, { status: 503 })
    }
  }

  const vpa = settings?.merchantVpa?.trim() || process.env.MERCHANT_UPI_ID?.trim() || ''
  const name = settings?.merchantName?.trim() || process.env.MERCHANT_PAYEE_NAME?.trim() || "Jamae's Craftopia"
  if (!/^[a-zA-Z0-9._-]{2,99}@[a-zA-Z0-9]{2,40}$/.test(vpa) || /your-vpa|example/i.test(vpa)) {
    return NextResponse.json({ success: false, error: 'UPI payments are not configured yet.' }, { status: 503 })
  }
  const whatsappNumber = (settings?.whatsappNumber || process.env.WHATSAPP_CONTACT_NUMBER || '').replace(/\D/g, '')

  cachedUpi = { vpa, name, whatsappNumber }
  cacheExpiresAt = now + 60000 // 60-second in-memory cache

  return NextResponse.json(
    { success: true, data: cachedUpi },
    { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } }
  )
}
