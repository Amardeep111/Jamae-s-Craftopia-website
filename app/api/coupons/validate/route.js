import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { db } from '@/lib/db/index.js'
import { verifySession, parseSessionCookie } from '@/lib/auth/session'

export async function POST(request) {
  try {
    const { code, subtotal, userEmail } = await request.json()
    const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
    const amount = Number(subtotal)
    if (!normalized || !Number.isFinite(amount) || amount < 0) return NextResponse.json({ success: false, error: 'Enter a valid coupon and cart subtotal.' }, { status: 400 })

    const session = await verifySession(parseSessionCookie(request.headers.get('cookie')))
    const userId = session?.user?.id || null
    const email = userEmail || session?.user?.email || null

    const coupon = await db.getCouponByCode(normalized)
    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt <= new Date())) return NextResponse.json({ success: false, error: "That coupon code isn't valid." }, { status: 404 })
    if (amount < coupon.minSubtotal) return NextResponse.json({ success: false, error: `This coupon requires a minimum cart of ₹${coupon.minSubtotal}.` }, { status: 400 })

    if (coupon.firstTimeOnly) {
      const existingUsageByUser = await db.getCouponUsage(coupon.id, userId)
      // If user has session userId or we have an email, also query directly for extra safety
      const existingUsage = existingUsageByUser || (
        userId ? await prisma.couponUsage.findFirst({ where: { couponId: coupon.id, userId: userId } }) : null
      )
      if (existingUsage) {
        return NextResponse.json({ success: false, error: 'This is a first-time-only coupon and has already been used.' }, { status: 400 })
      }
    }

    if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { code: coupon.code, label: coupon.label, discount: coupon.discountPercent / 100, minSubtotal: coupon.minSubtotal, firstTimeOnly: coupon.firstTimeOnly } })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not validate this coupon. Please try again.' }, { status: 500 })
  }
}
