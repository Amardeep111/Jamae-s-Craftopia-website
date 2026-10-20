'use client'

import { ShoppingBag, Tag, Truck } from 'lucide-react'
import { formatPrice } from '@/data/products'
import { useCartStore } from '@/lib/cart'
import { useCouponStore } from '@/lib/coupon'
import { couponDiscountAmount } from '@/lib/coupon'

export default function OrderSummary() {
  const items = useCartStore((s) => s.items)
  const coupon = useCouponStore((s) => s.coupon)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const discount = couponDiscountAmount(coupon, totalPrice)
  const gstTotal = items.reduce((sum, item) => sum + (item.gstAmount || Math.round(item.price * (item.gstPercent || 0) / 100)) * item.quantity, 0)
  const codFeeTotal = items.reduce((sum, item) => sum + (item.codFee || 0) * item.quantity, 0)
  const otherChargeTotal = items.reduce((sum, item) => sum + (item.otherCharge || 0) * item.quantity, 0)
  const finalTotal = totalPrice - discount + gstTotal + otherChargeTotal

  return (
    <aside className="paper-card p-6 sticky top-6">
      <h3 className="font-display text-xl text-plum mb-1">Order summary</h3>
      <p className="text-xs text-muted mb-4">Your bag is preserved across checkout steps.</p>

      <ul className="divide-y divide-sand">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
              <img src={item.visual || item.image || ''} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-plum truncate">{item.name}</p>
              <p className="text-xs text-muted">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-plum text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-3 text-sm text-muted">Your bag is empty.</li>
        )}
      </ul>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between text-muted"><span className="flex items-center gap-2"><ShoppingBag className="h-3.5 w-3.5" /> Items</span><span>{totalItems}</span></div>
        <div className="flex justify-between text-plum font-semibold"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
        {discount > 0 && (
          <div className="flex justify-between text-bloom font-semibold"><span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Discount ({coupon.code})</span><span>-{formatPrice(discount)}</span></div>
        )}
        {gstTotal > 0 && <div className="flex justify-between text-muted"><span>GST</span><span>+{formatPrice(gstTotal)}</span></div>}
        {otherChargeTotal > 0 && <div className="flex justify-between text-muted"><span>Other product charges</span><span>+{formatPrice(otherChargeTotal)}</span></div>}
        {codFeeTotal > 0 && <div className="flex justify-between text-muted"><span>COD fees (if selected)</span><span>+{formatPrice(codFeeTotal)}</span></div>}
        <div className="border-t border-sand pt-2 mt-2 flex justify-between"><span className="font-medium text-plum">Before shipping / COD</span><span className="font-display text-xl text-plum">{formatPrice(finalTotal)}</span></div>
      </div>

      <div className="mt-5 rounded-2xl bg-ivory/60 p-3 ring-1 ring-sand">
        <label className="flex items-center gap-2 text-sm font-medium text-plum">Apply coupon
          <input
            aria-label="Coupon code"
            placeholder="CODE20"
            className="ml-2 flex-1 rounded-full border border-sand bg-white px-3 py-1.5 text-sm text-plum outline-none focus:ring-2 focus:ring-plum/20"
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const input = e.currentTarget
                const apply = useCouponStore.getState().apply
                await apply(input.value, totalPrice)
                input.value = ''
              }
            }}
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl bg-ivory/60 p-3 text-xs text-muted flex items-start gap-2">
        <Truck className="h-4 w-4 text-bloom shrink-0 mt-0.5" aria-hidden="true" />
        <p>Handmade pieces — ships within 3–5 days. Delivery address selected above will be saved.</p>
      </div>
    </aside>
  )
}
