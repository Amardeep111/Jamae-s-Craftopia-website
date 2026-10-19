/**
 * Coupon store — single source of truth across cart, order summary, and payment.
 *
 * Backed by zustand + persist using the same storage key OrderSummary already
 * reads from (`jamaes:coupon`), so any previously-applied coupon survives a
 * reload and every checkout step sees the same discount.
 *
 * The coupon itself is just { code, discount, label }. Discount is a fraction
 * of the subtotal (e.g. 0.1 = 10%). The actual discount amount is computed
 * from the live subtotal in the pricing layer, never stored here.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const COUPON_STORAGE_KEY = 'jamaes:coupon'

export const DEMO_COUPONS = {}

export const useCouponStore = create(
  persist(
    (set, get) => ({
      coupon: null,
      loading: false,
      error: '',

      async apply(code, subtotal) {
        const c = (code || '').trim().toUpperCase()
        if (!c) {
          set({ error: 'Please enter a coupon code.' })
          return false
        }
        set({ loading: true, error: '' })
        try {
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: c, subtotal }),
          })
          const result = await response.json()
          if (!response.ok || !result.success) throw new Error(result.error || "That coupon code isn't valid.")
          set({ coupon: result.data, error: '', loading: false })
          return true
        } catch (error) {
          set({ error: error.message || 'Could not validate this coupon.', loading: false })
          return false
        }
      },

      remove() {
        set({ coupon: null, error: '' })
      },

      clear() {
        set({ coupon: null, error: '', loading: false })
      },
    }),
    {
      name: COUPON_STORAGE_KEY,
    }
  )
)

export function couponDiscountAmount(coupon, subtotal) {
  if (!coupon || !subtotal) return 0
  return Math.round(subtotal * coupon.discount)
}
