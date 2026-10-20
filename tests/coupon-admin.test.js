import { test, expect } from '@playwright/test'

/**
 * Feature 6: Admin coupon management for firstTimeOnly + maxUses + currentUses.
 */
test.describe('admin coupon management', () => {
  test('admin create with firstTimeOnly and maxUses persists correctly', async ({ request }) => {
    // POST to admin coupons endpoint with new fields
    const post = await request.post('http://localhost:3000/api/admin/coupons', {
      data: {
        code: 'ADMIN6',
        label: 'Admin feature 6',
        discountPercent: 15,
        minSubtotal: 0,
        expiresAt: '',
        firstTimeOnly: true,
        maxUses: 50,
      },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(post.ok()).toBeTruthy()
    const body = await post.json()
    expect(body.success).toBeTruthy()
    expect(body.data.code).toBe('ADMIN6')
    expect(body.data.firstTimeOnly).toBe(true)
    expect(body.data.maxUses).toBe(50)
    expect(body.data.currentUses).toBe(0)

    // PATCH to update maxUses and deactivate firstTimeOnly
    const patch = await request.patch('http://localhost:3000/api/admin/coupons', {
      data: {
        id: body.data.id,
        firstTimeOnly: false,
        maxUses: 100,
        active: true,
      },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(patch.ok()).toBeTruthy()
    const patchBody = await patch.json()
    expect(patchBody.success).toBeTruthy()
    expect(patchBody.data.firstTimeOnly).toBe(false)
    expect(patchBody.data.maxUses).toBe(100)
  })
})
