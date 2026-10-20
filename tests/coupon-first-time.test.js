/**
 * Feature 1: First-time customer tracking.
 *
 * A coupon flagged `firstTimeOnly` may only be redeemed once per customer.
 * Once a `CouponUsage` row exists for that (coupon, user) pair, validating
 * the same coupon for that user must fail.
 *
 * The route handler is exercised end-to-end against the real database: a
 * throwaway coupon + user are created, the coupon is validated once (allowed),
 * a usage row is recorded, and validating again for the same user must be
 * rejected with the first-time error.
 *
 * Run with:  node tests/coupon-first-time.test.js
 */
import assert from 'node:assert/strict'

import { prisma } from '../app/lib/db/client.js'
import { db } from '../app/lib/db/index.js'
import { POST as validateCoupon } from '../app/api/coupons/validate/route.js'

const SUFFIX = Date.now().toString(36)
const CODE = `FIRSTONLY${SUFFIX}`.toUpperCase()
const USER_EMAIL = `coupon-first-time-${SUFFIX}@example.test`

function jsonRequest(body) {
  return new Request('http://localhost/api/coupons/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function main() {
  // --- Setup: a first-time-only coupon and a customer -----------------------
  const coupon = await prisma.coupon.create({
    data: {
      code: CODE,
      label: 'First time only',
      discountPercent: 10,
      minSubtotal: 0,
      active: true,
      firstTimeOnly: true,
      maxUses: 0,
      currentUses: 0,
    },
  })
  const user = await prisma.user.create({
    data: {
      email: USER_EMAIL,
      // bcrypt hash of 'password123' is not needed; this column is unused here.
      password: 'not-a-real-hash',
      name: 'Coupon Test User',
    },
  })

  let created = false
  try {
    // --- 1. First validation: no usage recorded yet, must succeed ----------
    const first = await validateCoupon(jsonRequest({ code: CODE, subtotal: 1000, userId: user.id }))
    const firstBody = await first.json()
    assert.equal(first.status, 200, `first validation should succeed, got ${first.status} ${JSON.stringify(firstBody)}`)
    assert.equal(firstBody.success, true, 'first validation should report success')
    assert.equal(firstBody.data.code, CODE, 'successful validation should echo the coupon code')
    created = true

    // --- 2. Record the usage, as checkout would ----------------------------
    const usage = await db.recordCouponUsage({ couponId: coupon.id, userId: user.id })
    assert.equal(usage.couponId, coupon.id, 'usage row should reference the coupon')
    assert.equal(usage.userId, user.id, 'usage row should reference the user')
    assert.equal(usage.used, true, 'usage row should be marked as used')

    // --- 3. Second validation: user has now used it, must be rejected ------
    const second = await validateCoupon(jsonRequest({ code: CODE, subtotal: 1000, userId: user.id }))
    const secondBody = await second.json()
    assert.equal(secondBody.success, false, 'a customer who already used a first-time-only coupon must be rejected')
    assert.equal(second.status, 400, 'rejection should use HTTP 400')
    assert.match(
      String(secondBody.error),
      /first-time/i,
      `error message should mention the first-time restriction, got: ${secondBody.error}`
    )

    // --- 4. A different customer can still use it --------------------------
    const other = await prisma.user.create({
      data: { email: `coupon-first-time-other-${SUFFIX}@example.test`, password: 'not-a-real-hash' },
    })
    const otherRes = await validateCoupon(jsonRequest({ code: CODE, subtotal: 1000, userId: other.id }))
    const otherBody = await otherRes.json()
    assert.equal(otherBody.success, true, 'a different customer should still be allowed to use the coupon')
    await prisma.user.delete({ where: { id: other.id } })

    console.log('PASS: first-time-only coupon cannot be reused by the same customer.')
  } finally {
    await prisma.couponUsage.deleteMany({ where: { couponId: coupon.id } })
    await prisma.coupon.delete({ where: { id: coupon.id } }).catch(() => {})
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
    if (created) {
      console.log('Cleanup complete.')
    }
  }
}

main()
  .then(() => {
    console.log('\nAll coupon first-time tests passed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nFAIL:', error.message)
    process.exit(1)
  })
