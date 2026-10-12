import { NextResponse } from 'next/server'

// POST /api/orders/refund
// Request body: { orderId, reason, amount?, type: 'RETURN' | 'REFUND' | 'CANCELLED' }
// Production: verify identity, check order status (must be DELIVERED for return,
// CONFIRMED/PROCESSING for cancellation), write to database, trigger notification.
export async function POST(request) {
  try {
    const body = await request.json()
    const { orderId, reason, amount, type } = body

    if (!orderId || !reason || !type) {
      return NextResponse.json({ success: false, error: 'orderId, reason and type required' }, { status: 400 })
    }

    const allowedTypes = ['RETURN', 'REFUND', 'CANCELLED']
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 })
    }

    // In production: lookup order by id, verify authorization (customer email or session),
    // enforce status rules (DELIVERED for return, not CANCELLED for refund, etc.),
    // record refund/return record, update order status if needed.

    // Mock response — never claims a real refund was processed.
    return NextResponse.json({
      success: true,
      message: 'Request received.',
      note: 'This is a mock endpoint. Refund/return processing requires real payment gateway integration.',
      data: { orderId, type, reason, submittedAt: new Date().toISOString() },
    })
  } catch (e) {
    console.error('Refund endpoint error:', e)
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 })
  }
}
