/**
 * POST /api/payment/confirm
 *
 * Verifies a payment with the provider. The backend — never the browser — is
 * the source of truth for whether a payment succeeded. The order is only
 * marked paid after this verification passes.
 */
import { NextResponse } from 'next/server'
import { verifyPaymentProvider } from '@/lib/paymentProvider'

export async function POST(request) {
  try {
    const body = await request.json()
    const { method, providerReference, details } = body || {}

    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Missing payment method.' },
        { status: 400 }
      )
    }

    const result = await verifyPaymentProvider({
      method,
      providerReference,
      details,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed.' },
      { status: 500 }
    )
  }
}