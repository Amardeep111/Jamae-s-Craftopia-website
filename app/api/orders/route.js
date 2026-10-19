import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { getProductDeliveryRestriction } from '@/lib/product-availability'

export async function POST(request) {
  try {
    const body = await request.json()
    const token = request.cookies.get('jamaes_session')?.value
    const session = await verifySession(token)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Please sign in again before placing your order.' }, { status: 401 })
    }

    if (!body.customerName || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 })
    }

    const method = body.paymentMethod === 'UPI' || body.paymentMethod === 'upi' ? 'upi' : body.paymentMethod === 'Cash on Delivery' || body.paymentMethod === 'cod' ? 'cod' : null
    if (!method) return NextResponse.json({ success: false, error: 'Choose an available payment method.' }, { status: 400 })

    const products = await db.getProducts({ published: true })
    const productMap = new Map(products.map((product) => [product.id, product]))
    const orderItems = []
    let subtotal = 0
    for (const item of body.items) {
      const product = productMap.get(item.productId)
      const quantity = Number(item.quantity)
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 || quantity > product.stock) {
        return NextResponse.json({ success: false, error: `${product?.name || 'An item'} is unavailable in the requested quantity.` }, { status: 400 })
      }
      const deliveryRestriction = getProductDeliveryRestriction(product, body.shippingAddress)
      if (deliveryRestriction) return NextResponse.json({ success: false, error: `${product.name}: ${deliveryRestriction}` }, { status: 400 })
      const allowedMethods = Array.isArray(product.allowedPaymentMethods) && product.allowedPaymentMethods.length ? product.allowedPaymentMethods : ['upi']
      if (!allowedMethods.includes(method)) return NextResponse.json({ success: false, error: `${product.name} cannot be purchased using ${method === 'upi' ? 'UPI' : 'Cash on Delivery'}.` }, { status: 400 })
      const unitPrice = Math.round(product.price * (100 - (product.discountPercent || 0)) / 100)
      const gstPercent = product.gstPercent || 0
      const gstAmount = Math.round(unitPrice * gstPercent / 100)
      const codFee = method === 'cod' ? (product.codFee || 0) : 0
      const otherCharge = product.otherCharge || 0
      orderItems.push({ productId: product.id, productName: product.name, unitPrice, gstPercent, gstAmount, codFee, otherCharge, quantity })
      subtotal += unitPrice * quantity
    }

    const coupon = body.couponCode ? await prisma.coupon.findUnique({ where: { code: String(body.couponCode).trim().toUpperCase() } }) : null
    if (coupon && (!coupon.active || (coupon.expiresAt && coupon.expiresAt <= new Date()) || subtotal < coupon.minSubtotal)) {
      return NextResponse.json({ success: false, error: 'That coupon is no longer available for this cart.' }, { status: 400 })
    }
    if (body.couponCode && !coupon) {
      return NextResponse.json({ success: false, error: 'That coupon code is no longer valid.' }, { status: 400 })
    }
    const discount = coupon ? Math.round(subtotal * coupon.discountPercent / 100) : 0
    const shipping = subtotal - discount >= 999 ? 0 : 49
    const gstTotal = orderItems.reduce((sum, item) => sum + item.gstAmount * item.quantity, 0)
    const codFeeTotal = orderItems.reduce((sum, item) => sum + item.codFee * item.quantity, 0)
    const otherChargeTotal = orderItems.reduce((sum, item) => sum + item.otherCharge * item.quantity, 0)
    const fee = gstTotal + codFeeTotal + otherChargeTotal
    const totalAmount = subtotal - discount + shipping + fee

    const order = await db.createOrder({
      customerName: body.customerName,
      userId: session.user.id,
      customerEmail: session.user.email,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress && typeof body.shippingAddress === 'object'
        ? Object.fromEntries(['fullName', 'mobileNumber', 'houseFlatBuilding', 'areaStreet', 'landmark', 'city', 'state', 'pinCode', 'country'].filter((field) => typeof body.shippingAddress[field] === 'string').map((field) => [field, body.shippingAddress[field].trim()]))
        : null,
      totalAmount,
      subtotal,
      discount,
      shipping,
      fee,
      paymentMethod: method === 'cod' ? 'Cash on Delivery' : 'UPI',
      paymentStatus: method === 'cod' ? 'COD_PENDING_COLLECTION' : 'AWAITING_VERIFICATION',
      status: method === 'cod' ? 'CONFIRMED' : 'PENDING',
      paymentReference: method === 'upi' && typeof body.paymentReference === 'string' ? body.paymentReference.trim().slice(0, 80) || null : null,
      notes: method === 'upi' ? `${body.notes || ''} | UPI payment reported by customer; verification required.`.trim() : body.notes,
      items: orderItems,
    })

    return NextResponse.json({ success: true, message: 'Order created successfully', data: order })
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
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    const sessionEmail = session?.user?.email

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
