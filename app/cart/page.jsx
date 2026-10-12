'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import ProductImage from '@/components/ui/ProductImage'
import { formatPrice } from '@/data/products'
import { useCartStore } from '@/lib/cart'
import { useCouponStore, couponDiscountAmount } from '@/lib/coupon'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const coupon = useCouponStore((s) => s.coupon)
  const applyCouponFn = useCouponStore((s) => s.apply)
  const removeCouponFn = useCouponStore((s) => s.remove)
  const couponLoading = useCouponStore((s) => s.loading)
  const couponError = useCouponStore((s) => s.error)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const discountAmount = couponDiscountAmount(coupon, subtotal)
  const total = subtotal - discountAmount

  const [couponInput, setCouponInput] = useState('')

  function handleApplyCoupon() {
    const ok = applyCouponFn(couponInput)
    if (ok) setCouponInput('')
  }

  function handleRemoveCoupon() {
    removeCouponFn()
  }

  if (items.length === 0) {
    return (
      <div className="container-page pb-20 pt-10 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-ivory/60 p-10 shadow-sm">
          <ShoppingBag className="mx-auto h-14 w-14 text-bloom" />
          <h1 className="heading-display mt-6 text-3xl">Your bag is empty</h1>
          <p className="mt-3 text-muted">Handmade pieces are waiting for you in the shop.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-plum px-5 py-2.5 text-sm font-semibold tracking-wide text-cream shadow-soft transition hover:bg-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page pb-20 pt-10">
      {/* Page header */}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-plum">
          <ArrowLeft className="h-4 w-4" /> Shop
        </Link>
        <span aria-hidden="true">/</span>
        <h1 className="heading-display text-3xl">Your Bag</h1>
        <span className="ml-auto rounded-full bg-plum px-3 py-1 text-sm font-semibold text-cream">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-5">
          {items.map((item) => (
            <div key={item.id} className="paper-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5">
              {/* Product image */}
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-sand">
                <ProductImage
                  visual={item.visual}
                  palette={item.palette}
                  alt={item.name}
                  className="h-full w-full"
                />
              </div>

              {/* Product info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-plum">{item.name}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-bloom">{formatPrice(item.price)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from bag`}
                    className="rounded-full p-2 text-muted transition hover:text-bloom hover:bg-sand"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {/* Quantity selector */}
                  <div className="inline-flex items-center rounded-full bg-ivory ring-1 ring-sand">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeItem(item.id)
                        } else {
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      }}
                      className="p-2 text-plum transition hover:text-bloom"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.75rem] text-center text-sm font-semibold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-plum transition hover:text-bloom"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Item subtotal */}
                  <span className="text-sm text-muted">
                    Subtotal:{' '}
                    <span className="font-semibold text-plum">{formatPrice(item.price * item.quantity)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <div className="pt-2">
            <Link href="/shop" className="inline-flex items-center gap-1.5 rounded-full bg-ivory px-5 py-2.5 text-sm font-semibold text-plum shadow-soft ring-1 ring-blush/80 transition hover:bg-blush/60 hover:-translate-y-0.5 active:translate-y-0">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-1">
          <div className="paper-card p-6">
            <h2 className="font-display text-2xl text-plum">Order Summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold text-plum">{formatPrice(subtotal)}</span>
              </div>

              {/* Discount line */}
              {coupon ? (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-bloom">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-semibold text-bloom">{coupon.code} — {coupon.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoupon()}
                    aria-label="Remove coupon"
                    className="text-xs text-muted underline transition hover:text-bloom"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-bloom">Discount</span>
                  <span className="font-semibold text-bloom">−{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-semibold text-plum">Calculated at checkout</span>
              </div>

              <div className="border-t border-sand pt-2 mt-2 flex justify-between">
                <span className="font-medium text-plum">Total</span>
                <span className="font-display text-xl text-plum">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Coupon input */}
            {!coupon && (
              <div className="mt-5 pt-4 border-t border-sand">
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="h-3.5 w-3.5 text-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Have a coupon?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase())
                      if (couponError) setCouponError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 rounded-full border border-sand bg-ivory px-4 py-2 text-sm text-plum placeholder:text-muted/60 outline-none transition focus:border-bloom focus:ring-2 focus:ring-bloom/20"
                    aria-label="Coupon code"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    variant="secondary"
                    className="shrink-0"
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </Button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-bloom" role="alert">{couponError}</p>
                )}
                <p className="mt-2 text-[10px] text-muted/70">Try: CRAFT10, WELCOME15, FIRSTORDER</p>
              </div>
            )}

            <Link href="/checkout/address" className="mt-5 flex w-full items-center justify-center rounded-full bg-plum px-5 py-2.5 text-sm font-semibold tracking-wide text-cream shadow-soft transition hover:bg-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0">
              Proceed to Checkout
            </Link>
            <p className="mt-3 text-center text-xs text-muted">Handmade pieces — ships within 3–5 days.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
