import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getAdminSession } from '@/lib/auth/admin'
import { sendEmailBestEffort, sendOrderUpdateEmail } from '@/lib/notification/email'

const validStatuses = new Set(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED'])
const validRefundStatuses = new Set(['APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'])
const orderTransitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'SHIPPED', 'CANCELLED'],
  IN_PROGRESS: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED'],
  RETURN_APPROVED: ['RETURN_IN_TRANSIT', 'RETURNED'],
  RETURN_IN_TRANSIT: ['RETURNED'],
  RETURNED: [],
  CANCELLED: [],
}
const paymentTransitions = {
  PENDING: ['AWAITING_VERIFICATION', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
  AWAITING_VERIFICATION: ['PAID', 'MANUAL_REVIEW', 'FAILED', 'EXPIRED'],
  MANUAL_REVIEW: ['PAID', 'FAILED'],
  COD_PENDING_COLLECTION: ['COD_COLLECTED'],
  FAILED: ['AWAITING_VERIFICATION'],
  EXPIRED: ['PENDING'],
}
const validPaymentStatuses = new Set(Object.keys(paymentTransitions).flatMap((status) => [status, ...paymentTransitions[status]]))

function normalizeList(value, { upper = false } = {}) {
  if (!Array.isArray(value)) return null
  return [...new Set(value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean).map((item) => upper ? item.toUpperCase() : item.replace(/\s+/g, ' ')))]
}

function normalizePaymentMethods(value) {
  if (!Array.isArray(value) || !value.length || value.some((method) => !['upi', 'cod'].includes(method))) return null
  return [...new Set(value)]
}

function productSlug(value) {
  return String(value || '').normalize('NFKD').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)
}

function productText(body, field, maxLength, required = false) {
  if (body[field] === undefined) return undefined
  if (typeof body[field] !== 'string') return null
  const value = body[field].trim()
  return value.length <= maxLength && (!required || value.length > 0) ? value : null
}

export async function GET(request, { params }) {
  const { resource: rawResource } = await params
  const resource = rawResource === 'custom-requests' ? 'customRequests' : rawResource
  const permission = { dashboard: 'dashboard.view', orders: 'orders.view', customRequests: 'customRequests.view', products: 'products.view', users: 'users.view', coupons: 'coupons.view', categories: 'categories.view', settings: 'settings.view' }[resource]
  if (!permission) return NextResponse.json({ success: false, error: 'Unknown admin resource.' }, { status: 404 })
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, permission)
  if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to view this section.' }, { status: 403 })
  try {
    if (resource === 'dashboard') {
      const [orders, users, products, pending] = await Promise.all([
        prisma.order.count(), prisma.user.count(), prisma.product.count({ where: { published: true } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
      ])
      return NextResponse.json({ success: true, data: { orders, users, products, pending } })
    }
    if (resource === 'categories') {
      const data = await prisma.category.findMany({ orderBy: { order: 'asc' } })
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'orders') {
      const data = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } }, refundRequests: { orderBy: { createdAt: 'desc' } } } })
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'customRequests') {
      const data = await prisma.customRequest.findMany({ orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'products') {
      const data = await prisma.product.findMany({ orderBy: { name: 'asc' }, include: { category: true } })
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'users') {
      const data = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, phone: true, role: true, active: true, createdAt: true, _count: { select: { orders: true, addresses: true } } } })
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'coupons') {
      const data = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'settings') {
      const data = await prisma.storeSetting.findUnique({ where: { id: 'main' } })
      return NextResponse.json({ success: true, data: data || { id: 'main', merchantVpa: '', merchantName: "Jamae's Craftopia", whatsappNumber: '' } })
    }
    return NextResponse.json({ success: false, error: 'Unknown admin resource.' }, { status: 404 })
  } catch (error) {
    console.error('Admin data request failed:', error)
    return NextResponse.json({ success: false, error: 'Could not load admin data.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const { resource: rawResource } = await params
  const resource = rawResource === 'custom-requests' ? 'customRequests' : rawResource
  const permission = { orders: 'orders.manage', customRequests: 'customRequests.manage', products: 'products.manage', users: 'users.manage', coupons: 'coupons.manage', categories: 'categories.manage', settings: 'settings.manage' }[resource]
  if (!permission) return NextResponse.json({ success: false, error: 'This resource cannot be updated.' }, { status: 405 })
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, permission)
  if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to make changes in this section.' }, { status: 403 })
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'The update could not be read. Please review it and try again.' }, { status: 400 })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false, error: 'A valid update is required.' }, { status: 400 })
    if (resource === 'customRequests') {
      const allowedStatuses = new Set(['NEW', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED'])
      const quotedPrice = body.quotedPrice === '' || body.quotedPrice === null || body.quotedPrice === undefined ? null : Number(body.quotedPrice)
      if (typeof body.id !== 'string' || !allowedStatuses.has(body.status) || typeof body.adminNotes !== 'string' || body.adminNotes.length > 2000) {
        return NextResponse.json({ success: false, error: 'Choose a valid status and keep internal notes under 2,000 characters.' }, { status: 400 })
      }
      if (quotedPrice !== null && (!Number.isInteger(quotedPrice) || quotedPrice < 1 || quotedPrice > 10000000)) return NextResponse.json({ success: false, error: 'Enter a whole price between ₹1 and ₹1,00,00,000.' }, { status: 400 })
      if (body.status === 'ACCEPTED' && quotedPrice === null) return NextResponse.json({ success: false, error: 'Add the quoted price before accepting this request.' }, { status: 400 })
      const current = await prisma.customRequest.findUnique({ where: { id: body.id } })
      if (!current) return NextResponse.json({ success: false, error: 'Custom request not found.' }, { status: 404 })
      const allowedNext = {
        NEW: ['REVIEWING', 'QUOTED', 'ACCEPTED', 'DECLINED'],
        REVIEWING: ['QUOTED', 'ACCEPTED', 'DECLINED'],
        QUOTED: ['ACCEPTED', 'DECLINED'],
        ACCEPTED: ['IN_PROGRESS', 'COMPLETED'],
        IN_PROGRESS: ['COMPLETED'],
        COMPLETED: [],
        DECLINED: [],
      }
      if (body.status !== current.status && !allowedNext[current.status]?.includes(body.status)) return NextResponse.json({ success: false, error: 'That custom request status change is not allowed.' }, { status: 409 })
      const data = await prisma.customRequest.update({ where: { id: body.id }, data: { status: body.status, adminNotes: body.adminNotes.trim() || null, quotedPrice: quotedPrice ?? current.quotedPrice } })
      const shouldSendQuote = body.status === 'ACCEPTED' && (current.status !== 'ACCEPTED' || data.quotedPrice !== current.quotedPrice)
      const shouldSendDecline = body.status === 'DECLINED' && current.status !== 'DECLINED'
      const customerEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.contact) ? current.contact : ''
      if (customerEmail && shouldSendQuote) {
        const settings = await prisma.storeSetting.findUnique({ where: { id: 'main' } }).catch(() => null)
        const vpa = settings?.merchantVpa?.trim() || process.env.MERCHANT_UPI_ID?.trim() || ''
        const merchantName = settings?.merchantName?.trim() || process.env.MERCHANT_PAYEE_NAME?.trim() || "Jamae's Craftopia"
        const upiUrl = /^[a-zA-Z0-9._-]{2,99}@[a-zA-Z0-9]{2,40}$/.test(vpa)
          ? `upi://pay?${new URLSearchParams({ pa: vpa, pn: merchantName, am: String(data.quotedPrice), cu: 'INR', tn: 'Custom order payment' })}`
          : ''
        const paymentText = upiUrl ? `Pay using this UPI link: ${upiUrl}\nUPI ID: ${vpa}\nAfter paying, reply to this email with the UTR/reference number.` : 'Reply to this email and we will share the payment details.'
        await sendEmailBestEffort(() => sendEmail({ to: customerEmail, subject: "Your custom order is accepted — price and payment details", text: `Hello ${current.name},\n\nYour custom request “${current.idea}” has been accepted. The total price is ₹${data.quotedPrice.toLocaleString('en-IN')}.\n\n${paymentText}\n\nWe will begin making your piece after payment is confirmed.\n\nJamae's Craftopia` }), 'custom-request-quote')
      }
      if (customerEmail && shouldSendDecline) {
        await sendEmailBestEffort(() => sendEmail({ to: customerEmail, subject: "An update on your custom order request", text: `Hello ${current.name},\n\nThank you for sharing “${current.idea}” with us. We are unable to take this request forward at this time. You are welcome to send us another idea.\n\nJamae's Craftopia` }), 'custom-request-declined')
      }
      return NextResponse.json({ success: true, data })
    }
    if (resource === 'users') {
      if (typeof body.id !== 'string' || typeof body.active !== 'boolean') return NextResponse.json({ success: false, error: 'Customer and account status are required.' }, { status: 400 })
      const customer = await prisma.user.findUnique({ where: { id: body.id }, select: { id: true, role: true } })
      if (!customer || customer.role !== 'CUSTOMER') return NextResponse.json({ success: false, error: 'Customer account not found.' }, { status: 404 })
      const updated = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({ where: { id: customer.id }, data: { active: body.active }, select: { id: true, email: true, name: true, active: true } })
        if (!body.active) await tx.session.updateMany({ where: { userId: customer.id, revokedAt: null }, data: { revokedAt: new Date() } })
        return user
      })
      return NextResponse.json({ success: true, data: updated })
    }
    if (resource === 'orders') {
      if (typeof body.refundRequestId === 'string') {
        if (!validRefundStatuses.has(body.refundStatus)) return NextResponse.json({ success: false, error: 'Choose a valid refund status.' }, { status: 400 })
        const refund = await prisma.refundRequest.findUnique({ where: { id: body.refundRequestId } })
        if (!refund) return NextResponse.json({ success: false, error: 'Refund request not found.' }, { status: 404 })
        const refundOrder = await prisma.order.findUnique({ where: { id: refund.orderId }, select: { orderNumber: true, customerEmail: true, customerName: true } })
        const allowedNext = {
          REQUESTED: ['APPROVED', 'REJECTED'],
          APPROVED: ['PROCESSING', 'REJECTED'],
          PROCESSING: ['COMPLETED'],
          COMPLETED: [],
          REJECTED: [],
        }
        if (!allowedNext[refund.status]?.includes(body.refundStatus)) {
          return NextResponse.json({ success: false, error: 'This refund status transition is not allowed.' }, { status: 409 })
        }
        const paymentStatus = body.refundStatus === 'APPROVED' ? 'REFUND_APPROVED'
          : body.refundStatus === 'PROCESSING' ? 'REFUND_PROCESSING'
          : body.refundStatus === 'COMPLETED' ? 'REFUNDED'
            : body.refundStatus === 'REJECTED' ? 'REFUND_REJECTED'
              : 'REFUND_REQUESTED'
        const updated = await prisma.$transaction(async (tx) => {
          const request = await tx.refundRequest.update({
            where: { id: refund.id },
            data: { status: body.refundStatus, reviewedBy: session.user.email, reviewedAt: new Date() },
          })
          await tx.order.update({ where: { id: refund.orderId }, data: { paymentStatus } })
          await tx.paymentLog.create({ data: { orderId: refund.orderId, amount: refund.amount, status: paymentStatus, provider: 'UPI', method: 'REFUND' } })
          return request
        })
        await sendEmailBestEffort(() => sendOrderUpdateEmail({ email: refundOrder?.customerEmail, name: refundOrder?.customerName, orderNumber: refundOrder?.orderNumber, paymentStatus }), 'refund-status-updated')
        return NextResponse.json({ success: true, data: updated })
      }
      if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 })
      const current = await prisma.order.findUnique({ where: { id: body.id }, select: { id: true, orderNumber: true, customerEmail: true, customerName: true, status: true, paymentStatus: true, paymentMethod: true, totalAmount: true } })
      if (!current) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
      const data = {}
      if (body.status !== undefined) {
        if (!validStatuses.has(body.status)) return NextResponse.json({ success: false, error: 'Choose a valid order status.' }, { status: 400 })
        if (body.status !== current.status && !orderTransitions[current.status]?.includes(body.status)) {
          return NextResponse.json({ success: false, error: 'That order status change is not allowed. Follow the fulfillment steps in order.' }, { status: 409 })
        }
        data.status = body.status
      }
      if (body.paymentStatus !== undefined) {
        if (!validPaymentStatuses.has(body.paymentStatus)) return NextResponse.json({ success: false, error: 'Choose a valid payment status.' }, { status: 400 })
        if (body.paymentStatus !== current.paymentStatus && !paymentTransitions[current.paymentStatus]?.includes(body.paymentStatus)) {
          return NextResponse.json({ success: false, error: 'That payment status change is not allowed.' }, { status: 409 })
        }
        data.paymentStatus = body.paymentStatus
      }
      for (const [field, maxLength] of [['trackingNumber', 100], ['shippingPartner', 100], ['estimatedDelivery', 100]]) {
        if (body[field] === undefined) continue
        if (typeof body[field] !== 'string' || body[field].trim().length > maxLength) {
          return NextResponse.json({ success: false, error: `Enter a valid ${field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}.` }, { status: 400 })
        }
        data[field] = body[field].trim() || null
      }
      if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'No order changes provided.' }, { status: 400 })
      const updated = await prisma.$transaction(async (tx) => {
        const saved = await tx.order.update({ where: { id: body.id }, data })
        // If order is returned, restore product stock for items
        if (body.status === 'RETURNED' && current.status !== 'RETURNED') {
          const orderItems = await tx.orderItem.findMany({ where: { orderId: body.id }, select: { productId: true, quantity: true } })
          for (const item of orderItems) {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
          }
        }
        if (body.paymentStatus && body.paymentStatus !== current.paymentStatus) {
          await tx.paymentLog.create({
            data: {
              orderId: current.id,
              amount: current.totalAmount,
              status: body.paymentStatus,
              provider: current.paymentMethod,
              method: 'ADMIN_STATUS_UPDATE',
              verifiedBy: session.user.email,
              verifiedAt: ['PAID', 'COD_COLLECTED'].includes(body.paymentStatus) ? new Date() : null,
            },
          })
        }
        return saved
      })
      if (body.status !== undefined || body.paymentStatus !== undefined || body.trackingNumber !== undefined) {
        await sendEmailBestEffort(() => sendOrderUpdateEmail({ email: current.customerEmail, name: current.customerName, orderNumber: current.orderNumber, status: updated.status, paymentStatus: updated.paymentStatus, trackingNumber: updated.trackingNumber }), 'order-status-updated')
      }
      return NextResponse.json({ success: true, data: updated })
    }
    if (resource === 'products') {
      if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 })
      const data = {}
      for (const [field, maxLength, required] of [['name', 120, true], ['short', 240, true], ['description', 10000, true], ['materials', 2000], ['care', 2000], ['customization', 2000], ['visual', 80], ['imageUrl', 2000]]) {
        const value = productText(body, field, maxLength, required)
        if (value === null) return NextResponse.json({ success: false, error: `Enter a valid ${field}.` }, { status: 400 })
        if (value !== undefined) data[field] = value
      }
      if (body.slug !== undefined) {
        const slug = productSlug(body.slug)
        if (!slug) return NextResponse.json({ success: false, error: 'Enter a valid product URL slug.' }, { status: 400 })
        const conflict = await prisma.product.findUnique({ where: { slug }, select: { id: true } })
        if (conflict && conflict.id !== body.id) return NextResponse.json({ success: false, error: 'That product URL is already in use.' }, { status: 409 })
        data.slug = slug
      }
      if (body.categoryId !== undefined) {
        if (typeof body.categoryId !== 'string' || !await prisma.category.findUnique({ where: { id: body.categoryId }, select: { id: true } })) return NextResponse.json({ success: false, error: 'Choose a valid category.' }, { status: 400 })
        data.categoryId = body.categoryId
      }
      if (body.price !== undefined) {
        const price = Number(body.price)
        if (!Number.isInteger(price) || price < 0) return NextResponse.json({ success: false, error: 'Price must be a non-negative whole number.' }, { status: 400 })
        data.price = price
      }
      if (body.stock !== undefined) {
        const stock = Number(body.stock)
        if (!Number.isInteger(stock) || stock < 0) return NextResponse.json({ success: false, error: 'Stock must be a non-negative whole number.' }, { status: 400 })
        data.stock = stock
      }
      if (body.discountPercent !== undefined) {
        const discountPercent = Number(body.discountPercent)
        if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 90) return NextResponse.json({ success: false, error: 'Item discount must be between 0% and 90%.' }, { status: 400 })
        data.discountPercent = discountPercent
      }
      for (const [field, max] of [['gstPercent', 100], ['codFee', Number.MAX_SAFE_INTEGER], ['otherCharge', Number.MAX_SAFE_INTEGER]]) {
        if (body[field] === undefined) continue
        const value = Number(body[field])
        if (!Number.isInteger(value) || value < 0 || value > max) return NextResponse.json({ success: false, error: `${field} must be a valid non-negative whole number${max === 100 ? ' up to 100' : ''}.` }, { status: 400 })
        data[field] = value
      }
      if (body.published !== undefined) {
        if (typeof body.published !== 'boolean') return NextResponse.json({ success: false, error: 'Published must be true or false.' }, { status: 400 })
        data.published = body.published
      }
      if (body.availableForSale !== undefined) {
        if (typeof body.availableForSale !== 'boolean') return NextResponse.json({ success: false, error: 'Availability must be true or false.' }, { status: 400 })
        data.availableForSale = body.availableForSale
      }
      if (body.featured !== undefined) {
        if (typeof body.featured !== 'boolean') return NextResponse.json({ success: false, error: 'Featured must be true or false.' }, { status: 400 })
        data.featured = body.featured
      }
      for (const [field, options] of [['unavailableStates', {}], ['unavailablePinCodes', { upper: true }]]) {
        if (body[field] === undefined) continue
        const values = normalizeList(body[field], options)
        if (!values || values.some((value) => value.length > 80)) return NextResponse.json({ success: false, error: `Enter valid ${field === 'unavailableStates' ? 'state names' : 'PIN codes'}.` }, { status: 400 })
        if (field === 'unavailablePinCodes' && values.some((value) => !/^\d{6}$/.test(value))) return NextResponse.json({ success: false, error: 'Each unavailable PIN code must contain 6 digits.' }, { status: 400 })
        data[field] = values
      }
      if (body.images !== undefined) {
        if (!Array.isArray(body.images) || body.images.length > 8 || body.images.some((url) => typeof url !== 'string' || url.length > 2000)) return NextResponse.json({ success: false, error: 'A product can have up to 8 valid gallery image URLs.' }, { status: 400 })
        data.images = [...new Set(body.images.map((url) => url.trim()).filter(Boolean))]
      }
      if (body.allowedPaymentMethods !== undefined) {
        const methods = normalizePaymentMethods(body.allowedPaymentMethods)
        if (!methods) return NextResponse.json({ success: false, error: 'Choose UPI, Cash on Delivery, or both.' }, { status: 400 })
        data.allowedPaymentMethods = methods
      }
      if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'No product changes provided.' }, { status: 400 })
      const updated = await prisma.product.update({ where: { id: body.id }, data })
      return NextResponse.json({ success: true, data: updated })
    }
    if (resource === 'categories') {
      if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Category ID is required.' }, { status: 400 })
      const data = {}
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (name === '') return NextResponse.json({ success: false, error: 'Category name is required.' }, { status: 400 })
      if (name && name.length > 120) return NextResponse.json({ success: false, error: 'Category name must be under 120 characters.' }, { status: 400 })
      if (name) data.name = name
      if (body.slug !== undefined) {
        const slugValue = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120) : ''
        if (!slugValue) return NextResponse.json({ success: false, error: 'Enter a valid URL slug.' }, { status: 400 })
        const conflict = await prisma.category.findUnique({ where: { slug: slugValue }, select: { id: true } })
        if (conflict && conflict.id !== body.id) return NextResponse.json({ success: false, error: 'That category URL is already in use.' }, { status: 409 })
        data.slug = slugValue
      }
      if (body.description !== undefined) {
        const desc = typeof body.description === 'string' ? body.description.trim() : ''
        if (desc && desc.length > 2000) return NextResponse.json({ success: false, error: 'Description too long.' }, { status: 400 })
        data.description = desc || null
      }
      if (body.accent !== undefined) {
        data.accent = typeof body.accent === 'string' && body.accent.trim() ? body.accent.trim() : null
      }
      if (body.image !== undefined) {
        const img = typeof body.image === 'string' ? body.image.trim() : ''
        data.image = img ? img : null
      }
      if (body.order !== undefined) {
        const order = Number(body.order)
        if (!Number.isInteger(order) || order < 0) return NextResponse.json({ success: false, error: 'Order must be a non-negative whole number.' }, { status: 400 })
        data.order = order
      }
      if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'No category changes provided.' }, { status: 400 })
      const updated = await prisma.category.update({ where: { id: body.id }, data })
      return NextResponse.json({ success: true, data: updated })
    }
    if (resource === 'coupons') {
      if (typeof body.id !== 'string' || !body.id) return NextResponse.json({ success: false, error: 'Coupon ID is required.' }, { status: 400 })
      const data = {}
      if (body.active !== undefined && typeof body.active === 'boolean') data.active = body.active
      if (body.firstTimeOnly !== undefined && typeof body.firstTimeOnly === 'boolean') data.firstTimeOnly = body.firstTimeOnly
      if (body.maxUses !== undefined) {
        const maxUses = Number(body.maxUses)
        if (!Number.isInteger(maxUses) || maxUses < 0) return NextResponse.json({ success: false, error: 'Max uses must be a non-negative whole number.' }, { status: 400 })
        data.maxUses = maxUses
      }
      if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'No coupon changes provided.' }, { status: 400 })
      const updated = await prisma.coupon.update({ where: { id: body.id }, data })
      return NextResponse.json({ success: true, data: updated })
    }
    if (resource === 'settings') {
      const merchantVpa = typeof body.merchantVpa === 'string' ? body.merchantVpa.trim() : ''
      const merchantName = typeof body.merchantName === 'string' ? body.merchantName.trim() : ''
      const whatsappNumber = typeof body.whatsappNumber === 'string' ? body.whatsappNumber.replace(/\D/g, '') : ''
      if (merchantVpa && !/^[a-zA-Z0-9._-]{2,99}@[a-zA-Z0-9]{2,40}$/.test(merchantVpa)) return NextResponse.json({ success: false, error: 'Enter a valid merchant UPI ID.' }, { status: 400 })
      if (!merchantName || merchantName.length > 80) return NextResponse.json({ success: false, error: 'Enter a valid merchant name.' }, { status: 400 })
      if (whatsappNumber && !/^\d{10,15}$/.test(whatsappNumber)) return NextResponse.json({ success: false, error: 'WhatsApp number must include the country code and 10–15 digits.' }, { status: 400 })
      const data = await prisma.storeSetting.upsert({ where: { id: 'main' }, create: { id: 'main', merchantVpa: merchantVpa || null, merchantName, whatsappNumber: whatsappNumber || null }, update: { merchantVpa: merchantVpa || null, merchantName, whatsappNumber: whatsappNumber || null } })
      return NextResponse.json({ success: true, data })
    }
    return NextResponse.json({ success: false, error: 'This resource cannot be updated.' }, { status: 405 })
  } catch (error) {
    console.error('Admin update failed:', error)
    return NextResponse.json({ success: false, error: 'Could not save the change.' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const { resource } = await params
  if (!['coupons', 'products', 'categories'].includes(resource)) return NextResponse.json({ success: false, error: 'Creation is not supported for this resource.' }, { status: 405 })
  const permission = resource === 'products' ? 'products.manage' : resource === 'categories' ? 'categories.manage' : 'coupons.manage'
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, permission)
  if (!session) return NextResponse.json({ success: false, error: `You do not have permission to create ${resource}.` }, { status: 403 })
  try {
    const body = await request.json()
    if (resource === 'products') {
      const name = productText(body, 'name', 120, true)
      const short = productText(body, 'short', 240, true)
      const description = productText(body, 'description', 10000, true)
      const categoryId = typeof body.categoryId === 'string' ? body.categoryId : ''
      const category = categoryId ? await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }) : null
      const price = Number(body.price)
      const stock = Number(body.stock ?? 0)
      const discountPercent = Number(body.discountPercent ?? 0)
      const gstPercent = Number(body.gstPercent ?? 0)
      const codFee = Number(body.codFee ?? 0)
      const otherCharge = Number(body.otherCharge ?? 0)
      if (!name || !short || !description || !category || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 90 || !Number.isInteger(gstPercent) || gstPercent < 0 || gstPercent > 100 || !Number.isInteger(codFee) || codFee < 0 || !Number.isInteger(otherCharge) || otherCharge < 0) {
        return NextResponse.json({ success: false, error: 'Add a name, category, description, and valid non-negative price, stock, discount, tax, and fee values.' }, { status: 400 })
      }
      const slug = productSlug(body.slug || name)
      if (!slug) return NextResponse.json({ success: false, error: 'Enter a valid product URL slug.' }, { status: 400 })
      let uniqueSlug = slug
      let suffix = 2
      while (await prisma.product.findUnique({ where: { slug: uniqueSlug }, select: { id: true } })) uniqueSlug = `${slug.slice(0, 94)}-${suffix++}`
      const unavailableStates = normalizeList(body.unavailableStates ?? [], {})
      const unavailablePinCodes = normalizeList(body.unavailablePinCodes ?? [], { upper: true })
      if (!unavailableStates || !unavailablePinCodes || unavailablePinCodes.some((pin) => !/^\d{6}$/.test(pin))) return NextResponse.json({ success: false, error: 'Enter valid unavailable states and 6-digit PIN codes.' }, { status: 400 })
      const allowedPaymentMethods = normalizePaymentMethods(body.allowedPaymentMethods ?? ['upi'])
      if (!allowedPaymentMethods) return NextResponse.json({ success: false, error: 'Choose UPI, Cash on Delivery, or both.' }, { status: 400 })
      const textFields = {}
      for (const [field, maxLength] of [['materials', 2000], ['care', 2000], ['customization', 2000], ['visual', 80], ['imageUrl', 2000]]) {
        const value = productText(body, field, maxLength)
        if (value === null) return NextResponse.json({ success: false, error: `Enter a valid ${field}.` }, { status: 400 })
        textFields[field] = value
      }
      const images = body.images ?? []
      if (!Array.isArray(images) || images.length > 8 || images.some((url) => typeof url !== 'string' || url.length > 2000)) return NextResponse.json({ success: false, error: 'A product can have up to 8 valid gallery image URLs.' }, { status: 400 })
      const featured = body.featured === true
      const published = body.published !== false
      const availableForSale = body.availableForSale !== false
      const product = await prisma.product.create({ data: { name, slug: uniqueSlug, categoryId, price, stock, discountPercent, gstPercent, codFee, otherCharge, short, description, ...textFields, images, featured, published, availableForSale, unavailableStates, unavailablePinCodes, allowedPaymentMethods } })
      return NextResponse.json({ success: true, data: product }, { status: 201 })
    }
    if (resource === 'categories') {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name || name.length > 120) return NextResponse.json({ success: false, error: 'Enter a category name (max 120 characters).' }, { status: 400 })
      const baseSlug = (typeof body.slug === 'string' && body.slug.trim() ? body.slug : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
      if (!baseSlug) return NextResponse.json({ success: false, error: 'Enter a valid URL slug.' }, { status: 400 })
      let uniqueSlug = baseSlug
      let suffix = 2
      while (await prisma.category.findUnique({ where: { slug: uniqueSlug }, select: { id: true } })) uniqueSlug = `${baseSlug.slice(0, 110)}-${suffix++}`
      const description = typeof body.description === 'string' ? body.description.trim() : ''
      if (description.length > 2000) return NextResponse.json({ success: false, error: 'Description must be under 2,000 characters.' }, { status: 400 })
      const accent = typeof body.accent === 'string' && body.accent.trim() ? body.accent.trim() : null
      const image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null
      const order = Number(body.order)
      const category = await prisma.category.create({ data: { name, slug: uniqueSlug, description: description || null, accent, image, order: Number.isInteger(order) && order >= 0 ? order : 0 } })
      return NextResponse.json({ success: true, data: category }, { status: 201 })
    }
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    const label = typeof body.label === 'string' ? body.label.trim() : ''
    const discountPercent = Number(body.discountPercent)
    const minSubtotal = Number(body.minSubtotal || 0)
    if (!/^[A-Z0-9_-]{3,24}$/.test(code) || !label || !Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100 || !Number.isInteger(minSubtotal) || minSubtotal < 0) {
      return NextResponse.json({ success: false, error: 'Enter a valid code, label, 1–100% discount, and non-negative minimum cart.' }, { status: 400 })
    }
    const maxUsesBody = Number(body.maxUses ?? 0)
    if (!Number.isInteger(maxUsesBody) || maxUsesBody < 0) return NextResponse.json({ success: false, error: 'Max uses must be a non-negative whole number.' }, { status: 400 })
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (expiresAt && Number.isNaN(expiresAt.getTime())) return NextResponse.json({ success: false, error: 'Enter a valid expiry date.' }, { status: 400 })
    const firstTimeOnly = body.firstTimeOnly === true
    const maxUses = maxUsesBody
    const coupon = await prisma.coupon.create({ data: { code, label, discountPercent, minSubtotal, expiresAt, firstTimeOnly, maxUses, currentUses: 0 } })
    return NextResponse.json({ success: true, data: coupon }, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ success: false, error: 'That coupon code already exists.' }, { status: 409 })
    return NextResponse.json({ success: false, error: 'Could not create coupon.' }, { status: 500 })
  }
}
