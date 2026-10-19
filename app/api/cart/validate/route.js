/**
 * POST /api/cart/validate
 *
 * Server-side cart validation and pricing calculation.
 * Never trust client-provided prices, stock, or totals.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request) {
  try {
    let body
    try { body = await request.json() } catch { return NextResponse.json({ success: false, error: 'A valid cart payload is required.' }, { status: 400 }) }
    const { items } = body || {}

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty.' }, { status: 400 })
    }

    // Fetch all products from the database
    const productIds = items.map(i => i.productId).filter(Boolean)
    const products = await db.getProducts({ published: true })
    const productMap = new Map(products.map(p => [p.id, p]))

    let subtotal = 0
    let gstTotal = 0
    let otherChargeTotal = 0
    let codFeeTotal = 0
    const validatedItems = []
    const errors = []

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        errors.push({ productId: item.productId, error: 'Product not found or unavailable.' })
        continue
      }
      if (product.availableForSale === false) {
        errors.push({ productId: item.productId, error: `${product.name} is temporarily unavailable for purchase.` })
        continue
      }

      const quantity = Math.max(1, Math.min(99, parseInt(item.quantity) || 1))

      // Use SERVER-SIDE price only
      const unitPrice = Math.round(product.price * (100 - (product.discountPercent || 0)) / 100)
      const lineTotal = unitPrice * quantity
      const gstPercent = product.gstPercent || 0
      const gstAmount = Math.round(unitPrice * gstPercent / 100)
      const codFee = product.codFee || 0
      const otherCharge = product.otherCharge || 0

      if (product.stock < quantity) {
        errors.push({ productId: item.productId, error: `Only ${product.stock} available in stock.` })
        continue
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        originalPrice: product.price,
        discountPercent: product.discountPercent || 0,
        gstPercent,
        gstAmount,
        codFee,
        otherCharge,
        quantity,
        lineTotal,
        stock: product.stock,
        allowedPaymentMethods: Array.isArray(product.allowedPaymentMethods) && product.allowedPaymentMethods.length ? product.allowedPaymentMethods : ['upi'],
      })

      subtotal += lineTotal
      gstTotal += gstAmount * quantity
      codFeeTotal += codFee * quantity
      otherChargeTotal += otherCharge * quantity
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Some items have issues.',
        errors,
      }, { status: 400 })
    }

    // Calculate shipping (free for orders over ₹999)
    const shipping = subtotal >= 999 ? 0 : 49 // Free over ₹999, otherwise ₹49
    const total = subtotal + shipping + gstTotal + otherChargeTotal

    return NextResponse.json({
      success: true,
      data: {
        items: validatedItems,
        subtotal,
        shipping,
        gstTotal,
        codFeeTotal,
        otherChargeTotal,
        total,
        itemCount: validatedItems.reduce((s, i) => s + i.quantity, 0),
      },
    })
  } catch (error) {
    console.error('Cart validation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to validate cart.' }, { status: 500 })
  }
}
