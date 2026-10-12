import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.customerName || !body.customerEmail || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 })
    }

    const order = await db.createOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || 'PAID',
      paymentReference: body.paymentReference,
      status: body.status || 'CONFIRMED',
      notes: body.notes,
      items: body.items,
    })

    const res = NextResponse.json({ success: true, message: 'Order created successfully', data: order })
    // Ensure session cookie is set so the success page can retrieve by orderNumber
    const sessionCookie = request.cookies.get('jamaes_session')
    if (!sessionCookie && body.customerEmail) {
      res.cookies.set('jamaes_session', body.customerEmail, { httpOnly: true, path: '/' })
    }
    return res
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    // ── Security: orders are always scoped by the authenticated session.
    // Never trust an email query param from the client.
    const sessionCookie = request.cookies.get('jamaes_session')
    const sessionEmail = sessionCookie?.value || null

    if (!sessionEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to view your orders.' },
        { status: 401 }
      )
    }

    if (orderNumber) {
      const order = await db.getOrderByNumber(orderNumber)
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
      }
      // Verify ownership server-side
      if (order.customerEmail !== sessionEmail) {
        return NextResponse.json({ success: false, error: 'Not authorized to view this order' }, { status: 403 })
      }
      return NextResponse.json({ success: true, data: order })
    }

    // List orders for the authenticated user only
    const orders = await db.getOrdersByEmail(sessionEmail)
    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching order(s):', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}
