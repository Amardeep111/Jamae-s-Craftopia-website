import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json()
    const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
    const amount = Number(subtotal)
    if (!normalized || !Number.isFinite(amount) || amount < 0) return NextResponse.json({ success: false, error: 'Enter a valid coupon and cart subtotal.' }, { status: 400 })
    const coupon = await prisma.coupon.findUnique({ where: { code: normalized } })
    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt <= new Date())) return NextResponse.json({ success: false, error: "That coupon code isn't valid." }, { status: 404 })
    if (amount < coupon.minSubtotal) return NextResponse.json({ success: false, error: `This coupon requires a minimum cart of ₹${coupon.minSubtotal}.` }, { status: 400 })
    return NextResponse.json({ success: true, data: { code: coupon.code, label: coupon.label, discount: coupon.discountPercent / 100 } })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not validate this coupon. Please try again.' }, { status: 500 })
  }
}
