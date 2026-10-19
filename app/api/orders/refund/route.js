import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'
import { sendEmailBestEffort, sendOrderUpdateEmail, sendSupportNotification } from '@/lib/notification/email'

const UPI_ID_RE = /^[\w.-]{2,256}@[\w.-]{2,64}$/

// Customer refund request. This records a request for staff review; it never
// represents that money has already been refunded.
export async function POST(request) {
  try {
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Please sign in to request a refund.' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, reason, refundUpiId } = body || {}
    if (typeof orderId !== 'string' || !orderId) {
      return NextResponse.json({ success: false, error: 'Order is required for a refund request.' }, { status: 400 })
    }
    if (typeof reason !== 'string' || reason.trim().length < 5 || reason.trim().length > 1000) {
      return NextResponse.json({ success: false, error: 'Please provide a reason between 5 and 1,000 characters.' }, { status: 400 })
    }
    const normalizedUpi = typeof refundUpiId === 'string' ? refundUpiId.trim() : ''
    if (!UPI_ID_RE.test(normalizedUpi)) {
      return NextResponse.json({ success: false, error: 'Enter a valid UPI ID for the refund.' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    if (order.customerEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'You are not allowed to request a refund for this order.' }, { status: 403 })
    }
    if (!['PAID', 'COD_COLLECTED', 'REFUND_REJECTED'].includes(order.paymentStatus)) {
      return NextResponse.json({ success: false, error: 'A refund can only be requested after payment has been received.' }, { status: 400 })
    }
    if (!['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return NextResponse.json({ success: false, error: 'This order is not yet eligible for a refund request.' }, { status: 400 })
    }

    const existing = await prisma.refundRequest.findFirst({
      where: { orderId: order.id, status: { in: ['REQUESTED', 'APPROVED', 'PROCESSING'] } },
    })
    if (existing) return NextResponse.json({ success: false, error: 'A refund request is already in progress for this order.' }, { status: 409 })

    const refundRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.refundRequest.create({
        data: { orderId: order.id, reason: reason.trim(), amount: order.totalAmount, refundUpiId: normalizedUpi },
      })
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: 'REFUND_REQUESTED' } })
      await tx.paymentLog.create({
        data: { orderId: order.id, amount: order.totalAmount, status: 'REFUND_REQUESTED', provider: 'UPI', method: 'REFUND' },
      })
      return created
    })

    await Promise.all([
      sendEmailBestEffort(() => sendOrderUpdateEmail({ email: order.customerEmail, name: order.customerName, orderNumber: order.orderNumber, paymentStatus: 'REFUND_REQUESTED' }), 'refund-requested'),
      sendEmailBestEffort(() => sendSupportNotification({ subject: `Refund requested for order ${order.orderNumber}`, text: `A refund request was submitted for order ${order.orderNumber} (${order.customerEmail}) for ₹${(order.totalAmount / 100).toFixed(2)}. Review it in the admin panel.` }), 'refund-support'),
    ])

    return NextResponse.json({ success: true, message: 'Refund request submitted for review.', data: refundRequest }, { status: 201 })
  } catch (error) {
    console.error('Refund request error:', error)
    return NextResponse.json({ success: false, error: 'We could not submit your refund request. Please try again.' }, { status: 500 })
  }
}
