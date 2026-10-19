/**
 * POST /api/orders/create
 *
 * Server-authoritative order creation with atomic transaction.
 * Validates cart, stock, prices, and payment method.
 * Uses idempotency key to prevent duplicate orders.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/auth/session'
import { sendEmailBestEffort, sendOrderPlacedEmail, sendSupportNotification } from '@/lib/notification/email'
import { getProductDeliveryRestriction } from '@/lib/product-availability'

export async function POST(request) {
  try {
    const body = await request.json()
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Please sign in before placing an order.' }, { status: 401 })
    }
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      paymentStatus,
      paymentReference,
      couponCode,
      notes,
      idempotencyKey,
    } = body || {}

    // ── Validate required fields ────────────────────────────────────────
    const errors = {}
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      errors.customerName = 'Please enter your full name.'
    }
    const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
    if (!customerEmail || !emailRe.test(customerEmail.trim())) {
      errors.customerEmail = 'Please enter a valid email address.'
    }
    if (!Array.isArray(items) || items.length === 0) {
      errors.items = 'Your cart is empty.'
    }
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      errors.shippingAddress = 'A delivery address is required.'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, error: 'Please review the highlighted fields.' },
        { status: 400 }
      )
    }

    if (customerEmail.trim().toLowerCase() !== session.user.email) {
      return NextResponse.json({ success: false, error: 'The signed-in account does not match the checkout email.' }, { status: 403 })
    }
    const method = paymentMethod === 'UPI' || paymentMethod === 'upi' ? 'upi' : paymentMethod === 'Cash on Delivery' || paymentMethod === 'cod' ? 'cod' : null
    if (!method) return NextResponse.json({ success: false, error: 'Choose an available payment method.' }, { status: 400 })

    const normalizedEmail = customerEmail.trim().toLowerCase()
    const trimmedName = customerName.trim()
    // Persist only the customer-facing delivery fields. Address records also
    // include IDs and timestamps, which should not become part of an order snapshot.
    const addressSnapshot = Object.fromEntries(
      ['fullName', 'mobileNumber', 'houseFlatBuilding', 'areaStreet', 'landmark', 'city', 'state', 'pinCode', 'country']
        .filter((field) => typeof shippingAddress[field] === 'string')
        .map((field) => [field, shippingAddress[field].trim()])
    )

    // ── Idempotency check ───────────────────────────────────────────────
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
      })
      if (existing) {
        return NextResponse.json({
          success: true,
          data: existing,
          message: 'Order already created.',
        })
      }
    }

    // ── Validate products and calculate server-side totals ──────────────
    const productIds = items.map(i => i.productId).filter(Boolean)
    const products = await db.getProducts({ published: true })
    const productMap = new Map(products.map(p => [p.id, p]))

    let subtotal = 0
    const orderItems = []
    const validationErrors = []

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        validationErrors.push({ productId: item.productId, error: 'Product not found or unavailable.' })
        continue
      }
      if (product.availableForSale === false) {
        validationErrors.push({ productId: item.productId, error: `${product.name} is temporarily unavailable for purchase.` })
        continue
      }

      const allowedMethods = Array.isArray(product.allowedPaymentMethods) && product.allowedPaymentMethods.length ? product.allowedPaymentMethods : ['upi']
      if (!allowedMethods.includes(method)) {
        validationErrors.push({ productId: item.productId, error: `${product.name} cannot be purchased using ${method === 'upi' ? 'UPI' : 'Cash on Delivery'}.` })
        continue
      }

      const deliveryRestriction = getProductDeliveryRestriction(product, addressSnapshot)
      if (deliveryRestriction) {
        validationErrors.push({ productId: item.productId, error: deliveryRestriction })
        continue
      }

      const quantity = Math.max(1, Math.min(99, parseInt(item.quantity) || 1))

      if (product.stock < quantity) {
        validationErrors.push({ productId: item.productId, error: `Only ${product.stock} available in stock.` })
        continue
      }

      // Use SERVER-SIDE price only
      const unitPrice = Math.round(product.price * (100 - (product.discountPercent || 0)) / 100)
      const lineTotal = unitPrice * quantity
      const gstPercent = product.gstPercent || 0
      const gstAmount = Math.round(unitPrice * gstPercent / 100)
      const codFee = paymentMethod === 'Cash on Delivery' ? (product.codFee || 0) : 0
      const otherCharge = product.otherCharge || 0

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        gstPercent,
        gstAmount,
        codFee,
        otherCharge,
        lineTotal,
      })

      subtotal += lineTotal
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Some items have issues.',
        errors: validationErrors,
      }, { status: 400 })
    }

    // ── Calculate shipping and totals ───────────────────────────────────
    const shipping = subtotal >= 999 ? 0 : 49 // Free over ₹999, else ₹49
    const coupon = couponCode ? await prisma.coupon.findUnique({ where: { code: String(couponCode).trim().toUpperCase() } }) : null
    if (coupon && (!coupon.active || (coupon.expiresAt && coupon.expiresAt <= new Date()) || subtotal < coupon.minSubtotal)) {
      return NextResponse.json({ success: false, error: 'That coupon is no longer available for this cart.' }, { status: 400 })
    }
    if (couponCode && !coupon) {
      return NextResponse.json({ success: false, error: 'That coupon code is not valid.' }, { status: 400 })
    }
    const discount = coupon ? Math.round(subtotal * coupon.discountPercent / 100) : 0
    const gstTotal = orderItems.reduce((sum, item) => sum + item.gstAmount * item.quantity, 0)
    const codFeeTotal = orderItems.reduce((sum, item) => sum + item.codFee * item.quantity, 0)
    const otherChargeTotal = orderItems.reduce((sum, item) => sum + item.otherCharge * item.quantity, 0)
    const fee = gstTotal + codFeeTotal + otherChargeTotal
    const totalAmount = subtotal + shipping + fee - discount

    // ── Atomic order creation with stock reservation ────────────────────
    const order = await prisma.$transaction(async (tx) => {
      // Generate order number
      const date = new Date()
      const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
      const orderNumber = `JM-${ymd}-${rand}`

      // Reserve stock atomically
      for (const item of orderItems) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
        if (product.stock < 0) {
          throw new Error(`Insufficient stock for ${item.productName}`)
        }
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: trimmedName,
          customerEmail: session.user.email,
          userId: session.user.id,
          customerPhone: customerPhone || null,
          shippingAddress: addressSnapshot,
          status: 'PENDING',
          paymentMethod: paymentMethod || null,
          paymentStatus: method === 'cod' ? 'COD_PENDING_COLLECTION' : 'AWAITING_VERIFICATION',
          paymentReference: method === 'upi' && typeof paymentReference === 'string' ? paymentReference.trim().slice(0, 80) || null : null,
          totalAmount,
          subtotal,
          discount,
          shipping,
          fee,
          notes: idempotencyKey ? `${notes || ''} | idempotency:${idempotencyKey}`.trim() : (notes || null),
          items: {
            create: orderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              gstPercent: item.gstPercent,
              gstAmount: item.gstAmount,
              codFee: item.codFee,
              otherCharge: item.otherCharge,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      })

      return newOrder
    })

    await Promise.all([
      sendEmailBestEffort(() => sendOrderPlacedEmail(order), 'order-placed'),
      sendEmailBestEffort(() => sendSupportNotification({ subject: `New order ${order.orderNumber}`, text: `Order ${order.orderNumber} was placed by ${order.customerName} (${order.customerEmail}). Total: ₹${(order.totalAmount / 100).toFixed(2)}. Payment: ${order.paymentStatus}.` }), 'new-order-support'),
    ])

    return NextResponse.json({
      success: true,
      message: 'Order created successfully.',
      data: order,
    }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order.' },
      { status: 500 }
    )
  }
}
