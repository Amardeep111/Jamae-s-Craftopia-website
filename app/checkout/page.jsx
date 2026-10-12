'use client'

import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/data/products'
import { useCartStore } from '@/lib/cart'
import { useAddressStore } from '@/lib/address'
import CheckoutProgress from '@/components/checkout/CheckoutProgress'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const selectedAddress = useAddressStore((s) => s.getSelectedAddress())

  if (items.length === 0) {
    return (
      <div className="container-page pb-20 pt-10 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-ivory/60 p-10 shadow-sm">
          <ShoppingBag className="mx-auto h-14 w-14 text-bloom" />
          <h1 className="heading-display mt-6 text-3xl">Your bag is empty</h1>
          <p className="mt-3 text-muted">Add a piece from the shop before checking out.</p>
          <Button as={Link} href="/shop" className="mt-6 inline-flex" variant="secondary">
            Browse the shop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page pb-20 pt-10">
      {/* Progress — Order Summary is active; Address is done */}
      <CheckoutProgress current="summary" />

      <div className="mt-6 mb-2 flex items-center gap-3">
        <Link href="/checkout/address" className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-plum">
          <ArrowLeft className="h-4 w-4" /> Back to address
        </Link>
        <span aria-hidden="true">/</span>
        <h1 className="font-display text-3xl text-plum">Order Summary</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Delivery address snapshot */}
          <div className="paper-card p-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="font-display text-2xl text-plum">Delivery address</h2>
              <Link href="/checkout/address" className="text-sm font-semibold text-bloom hover:text-plum underline underline-offset-4">
                Change
              </Link>
            </div>
            {selectedAddress ? (
              <div className="mt-2 text-sm text-plum leading-relaxed">
                <p className="font-semibold">{selectedAddress.fullName} · +91 {selectedAddress.mobileNumber}</p>
                <p className="text-muted">
                  {selectedAddress.houseFlatBuilding}, {selectedAddress.areaStreet}
                  {selectedAddress.landmark ? `, ${selectedAddress.landmark}` : ''}
                </p>
                <p className="text-muted">{selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pinCode}</p>
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted">
                <p>No address selected. <Link href="/checkout/address" className="font-semibold text-bloom hover:text-plum underline underline-offset-4">Choose an address</Link></p>
              </div>
            )}
          </div>

          <div className="paper-card p-6">
            <h2 className="font-display text-2xl text-plum">Order summary</h2>
            <ul className="mt-4 divide-y divide-sand">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold text-plum">{item.name}</p>
                    <p className="text-xs text-muted">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-plum">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="paper-card p-6">
            <h2 className="font-display text-2xl text-plum">Payment</h2>
            <p className="mt-3 text-sm text-muted">
              Choose your preferred payment method and complete your order securely.
            </p>
            <Link href="/checkout/payment" className="mt-5 inline-flex w-full justify-center items-center rounded-full bg-plum px-5 py-2.5 text-sm font-semibold tracking-wide text-cream shadow-soft transition hover:bg-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0">
              Continue to payment
            </Link>
          </div>
        </div>

        {/* RIGHT: totals */}
        <aside>
          <div className="paper-card p-6 lg:sticky lg:top-6">
            <h2 className="font-display text-2xl text-plum">Total</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Items</span><span className="font-semibold text-plum">{totalItems}</span></div>
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold text-plum">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="font-semibold text-plum">Calculated next</span></div>
              <div className="border-t border-sand pt-2 mt-2 flex justify-between"><span className="font-medium text-plum">Total</span><span className="font-display text-xl text-plum">{formatPrice(totalPrice)}</span></div>
            </div>
            <p className="mt-3 text-center text-xs text-muted">Handmade pieces — ships within 3–5 days.</p>
            <Button as={Link} href="/checkout/address" className="mt-4 w-full" variant="secondary">
              Back to address
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
