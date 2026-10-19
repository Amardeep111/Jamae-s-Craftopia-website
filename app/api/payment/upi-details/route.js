import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  let settings = null
  if (prisma?.storeSetting) {
    try {
      settings = await prisma.storeSetting.findUnique({ where: { id: 'main' } })
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
  return NextResponse.json({ success: true, data: { vpa, name, whatsappNumber } }, { headers: { 'Cache-Control': 'no-store' } })
}
