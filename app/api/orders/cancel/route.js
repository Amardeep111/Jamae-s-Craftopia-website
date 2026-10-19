/**
 * POST /api/orders/cancel
 *
 * Cancels an order and releases reserved stock atomically.
 * Only orders in PENDING or CONFIRMED states can be cancelled.
 * Updates Product.stock back, logs audit event.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'
import { sendEmailBestEffort, sendOrderUpdateEmail } from '@/lib/notification/email'

export async function POST(request) {
  try {
    const body = await request.json()
    const { orderNumber } = body || {}
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Please sign in to cancel this order.' }, { status: 401 })
    }

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number is required.' }, { status: 400 })
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }

    if (order.customerEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'You are not allowed to cancel this order.' }, { status: 403 })
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ success: true, message: 'Order already cancelled.', data: order })
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return NextResponse.json({ success: false, error: 'This order can no longer be cancelled.' }, { status: 400 })
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: false, error: 'Paid orders require a refund review. Please contact us to cancel.' }, { status: 400 })
    }

    // Atomic cancellation: update order status + release stock
    const updated = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: { in: ['PENDING', 'CONFIRMED'] } },
        data: { status: 'CANCELLED', paymentStatus: 'CANCELLED' },
      })
      if (!claimed.count) return null

      // Release stock once the status transition is claimed.
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      // Update order
      const cancelledOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      })

      // Log audit event
      await tx.paymentLog.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          status: 'CANCELLED',
          provider: order.paymentMethod,
          method: 'ORDER_CANCELLATION',
        },
      })

      return cancelledOrder
    })

    if (!updated) return NextResponse.json({ success: false, error: 'This order can no longer be cancelled.' }, { status: 409 })

    await sendEmailBestEffort(() => sendOrderUpdateEmail({ email: updated.customerEmail, name: updated.customerName, orderNumber: updated.orderNumber, status: 'CANCELLED', paymentStatus: updated.paymentStatus }), 'order-cancelled')

    return NextResponse.json({
      success: true,
      message: 'Order cancelled. Stock released.',
      data: updated,
    })
  } catch (error) {
    console.error('Order cancellation error:', error)
    return NextResponse.json({ success: false, error: 'We could not cancel this order right now. Please try again or contact support.' }, { status: 500 })
  }
}
