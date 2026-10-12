/**
 * POST /api/payment/fee
 *
 * Returns the handling fee for a payment method/amount. Keeps client and server
 * pricing in sync by centralizing the fee rules on the server.
 */
import { NextResponse } from 'next/server'
import { PAYMENT_FEE_FOR } from '@/lib/paymentFees'

export async function POST(request) {
  try {
    const body = await request.json()
    const fee = PAYMENT_FEE_FOR(body?.method, body?.amount)
    return NextResponse.json({ success: true, data: { fee, free: fee === 0 } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not compute fee.' },
      { status: 500 }
    )
  }
}