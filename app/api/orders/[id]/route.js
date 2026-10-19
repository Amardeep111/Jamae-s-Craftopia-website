import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/auth/session'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Server-side ownership check
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    const sessionEmail = session?.user?.email

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

    return NextResponse.json({ success: false, error: 'Order updates are not available through this endpoint.' }, { status: 405 })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}
