import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Server-side ownership check
    const sessionCookie = request.cookies.get('jamaes_session')
    const sessionEmail = sessionCookie?.value || null

    const order = await db.getOrderById(id)
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (!sessionEmail) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please log in.' }, { status: 401 })
    }

    if (order.customerEmail !== sessionEmail) {
      return NextResponse.json({ success: false, error: 'Not authorized to view this order' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching order by id:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const sessionCookie = request.cookies.get('jamaes_session')
    const sessionEmail = sessionCookie?.value || null

    if (!sessionEmail) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const order = await db.getOrderById(id)
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (order.customerEmail !== sessionEmail) {
      return NextResponse.json({ success: false, error: 'Not authorized to modify this order' }, { status: 403 })
    }

    const allowed = ['status', 'paymentStatus', 'trackingNumber', 'shippingPartner', 'estimatedDelivery']
    const patch = {}
    for (const k of allowed) {
      if (k in body) patch[k] = body[k]
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await db.updateOrderStatus(id, patch)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}
