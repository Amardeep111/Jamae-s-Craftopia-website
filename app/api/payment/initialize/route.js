/**
 * POST /api/payment/initialize
 *
 * Creates a payment intent for the given method/amount and returns a
 * provider reference. Provider credentials are read server-side from env vars.
 *
 * When no real provider is configured, the service returns an explicit
 * `testMode: true` flag so the UI can surface that no real money moved.
 * This route NEVER fabricates a success response.
 */
import { NextResponse } from 'next/server'
import { initializePaymentProvider } from '@/lib/paymentProvider'

export async function POST(request) {
  try {
    const body = await request.json()
    const { method, details, amount, currency } = body || {}

    if (!method || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment request.' },
        { status: 400 }
      )
    }

    const result = await initializePaymentProvider({
      method,
      details,
      amount,
      currency: currency || 'INR',
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize payment.' },
      { status: 500 }
    )
  }
}