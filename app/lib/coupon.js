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

export const DEMO_COUPONS = {
  CRAFT10: { discount: 0.1, label: '10% off' },
  WELCOME15: { discount: 0.15, label: '15% off' },
  FIRSTORDER: { discount: 0.2, label: '20% off' },
}

export const useCouponStore = create(
  persist(
    (set, get) => ({
      coupon: null,
      loading: false,
      error: '',

      apply(code) {
        const c = (code || '').trim().toUpperCase()
        if (!c) {
          set({ error: 'Please enter a coupon code.' })
          return false
        }
        const match = DEMO_COUPONS[c]
        if (!match) {
          set({ error: "That coupon code isn't valid." })
          return false
        }
        set({ coupon: { code: c, ...match }, error: '', loading: false })
        return true
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