import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'

export const runtime = 'nodejs'

/**
 * Public coupon listing.
 *
 * GET /api/coupons
 *
 * Returns every active, unexpired coupon. Coupons that the signed-in customer
 * is not eligible for are returned in separate buckets instead of being mixed
 * into the main list:
 *
 *   data       - coupons the customer can actually use right now
 *   used       - first-time-only coupons the customer has already redeemed
 *   exhausted  - coupons whose global usage limit has been reached
 *
 * Anonymous visitors get the full list minus the exhausted coupons, since
 * there is no customer history to filter on.
 */
export async function GET(request) {
  try {
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    const userId = session?.user?.id || null
    const now = new Date()

    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'desc' }],
    })

    // Which of these coupons has this customer already redeemed?
    const usedCouponIds = new Set()
    if (userId && coupons.length) {
      const usages = await prisma.couponUsage.findMany({
        where: { userId, used: true, couponId: { in: coupons.map((c) => c.id) } },
        select: { couponId: true },
      })
      for (const usage of usages) usedCouponIds.add(usage.couponId)
    }

    const available = []
    const used = []
    const exhausted = []

    for (const c of coupons) {
      const limitReached = c.maxUses > 0 && c.currentUses >= c.maxUses
      const hasUsed = usedCouponIds.has(c.id)
      const firstTimeBlocked = c.firstTimeOnly && hasUsed

      const status = limitReached ? 'limit reached' : firstTimeBlocked ? 'used' : 'available'

      const item = {
        id: c.id,
        code: c.code,
        label: c.label,
        discountPercent: c.discountPercent,
        minSubtotal: c.minSubtotal,
        maxUses: c.maxUses,
        currentUses: c.currentUses,
        remainingUses: c.maxUses > 0 ? Math.max(0, c.maxUses - c.currentUses) : null,
        firstTimeOnly: c.firstTimeOnly,
        expiresAt: c.expiresAt,
        active: c.active,
        hasUsed,
        available: status === 'available',
        status,
      }

      if (status === 'available') available.push(item)
      else if (status === 'used') used.push(item)
      else exhausted.push(item)
    }

    return NextResponse.json(
      { success: true, data: available, used, exhausted, isLoggedIn: Boolean(userId) },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Get coupons failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to load coupons.' }, { status: 500 })
  }
}
