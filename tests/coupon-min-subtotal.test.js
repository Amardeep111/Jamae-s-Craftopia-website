import { describe, it } from 'node:test'
import assert from 'node:assert'
import { useCouponStore } from '../app/lib/coupon.js'

describe('coupon min-subtotal re-check', () => {
  it('keeps the coupon while the subtotal stays above minSubtotal', () => {
    useCouponStore.setState({
      coupon: { code: 'MIN100', label: 'Min 100', discount: 0.1, minSubtotal: 100 },
      error: '',
      loading: false,
    })
    assert.strictEqual(useCouponStore.getState().revalidate(150), true)
    assert.strictEqual(useCouponStore.getState().coupon?.code, 'MIN100')
    assert.strictEqual(useCouponStore.getState().error, '')
  })

  it('removes the coupon when the subtotal drops below minSubtotal', () => {
    useCouponStore.setState({
      coupon: { code: 'MIN500', label: 'Min 500', discount: 0.1, minSubtotal: 500 },
      error: '',
      loading: false,
    })
    assert.strictEqual(useCouponStore.getState().revalidate(600), true)
    assert.strictEqual(useCouponStore.getState().coupon?.code, 'MIN500')

    // Cart reduced: subtotal now 100, under the 500 minimum.
    assert.strictEqual(useCouponStore.getState().revalidate(100), false)
    assert.strictEqual(useCouponStore.getState().coupon, null)
    assert.match(useCouponStore.getState().error, /minimum cart of ₹500/)
  })

  it('treats a coupon with no minSubtotal as always valid', () => {
    useCouponStore.setState({
      coupon: { code: 'ANY', label: 'Any', discount: 0.1 },
      error: '',
      loading: false,
    })
    assert.strictEqual(useCouponStore.getState().revalidate(0), true)
    assert.strictEqual(useCouponStore.getState().coupon?.code, 'ANY')
  })

  it('is a no-op when no coupon is applied', () => {
    useCouponStore.setState({ coupon: null, error: '', loading: false })
    assert.strictEqual(useCouponStore.getState().revalidate(0), true)
    assert.strictEqual(useCouponStore.getState().coupon, null)
    assert.strictEqual(useCouponStore.getState().error, '')
  })

  it('apply() refuses to keep a coupon whose subtotal is under the minimum', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: { code: 'MIN500', label: 'Min 500', discount: 0.1, minSubtotal: 500 },
      }),
    })
    try {
      useCouponStore.setState({ coupon: null, error: '', loading: false })
      const applied = await useCouponStore.getState().apply('MIN500', 100)
      assert.strictEqual(applied, false)
      assert.strictEqual(useCouponStore.getState().coupon, null)
      assert.match(useCouponStore.getState().error, /minimum cart of ₹500/)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('apply() keeps a coupon whose subtotal meets the minimum', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: { code: 'MIN500', label: 'Min 500', discount: 0.1, minSubtotal: 500 },
      }),
    })
    try {
      useCouponStore.setState({ coupon: null, error: '', loading: false })
      const applied = await useCouponStore.getState().apply('MIN500', 900)
      assert.strictEqual(applied, true)
      assert.strictEqual(useCouponStore.getState().coupon?.code, 'MIN500')
      assert.strictEqual(useCouponStore.getState().error, '')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
