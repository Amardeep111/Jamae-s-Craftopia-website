'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  Calendar,
  Copy,
  Download,
  Mail,
  AlertCircle,
  Loader2,
  Star,
  ChevronRight,
} from 'lucide-react'
import { formatPrice } from '@/data/products'
import { STATUS_META, STATUS_FLOW, getFlowIndex, getStatusMeta } from '@/components/orders/orderConstants'
import Button from '@/components/ui/Button'
import { useUserStore } from '@/lib/user'

function StatusTimeline({ status }) {
  const currentIndex = getFlowIndex(status)
  const isCancelled = status === 'CANCELLED'
  const isPending   = status === 'PENDING'
  const meta        = getStatusMeta(status)

  return (
    <div className="relative" aria-label="Order tracking timeline">
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-sand hidden sm:block" aria-hidden="true" />
      <div className="flex justify-between relative">
        {STATUS_FLOW.map((s, i) => {
          const m = STATUS_META[s]
          const Icon = m.icon
          const done  = currentIndex >= i
          const live  = currentIndex === i && !isCancelled
          return (
            <div key={s} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  done ? `${m.bg} ${m.color} border-transparent` : 'border-sand bg-ivory text-muted',
                  live ? 'shadow-md scale-110' : '',
                ].join(' ')}
              >
                {done ? <Icon className="h-4 w-4" aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-sand" />}
              </div>
              <p className={['text-xs font-medium text-center max-w-[4rem]', done ? m.color : 'text-muted/60'].join(' ')}>
                {m.label}
              </p>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-center text-sm text-muted">{meta.desc}</p>
    </div>
  )
}

function OrderDetailContent() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId

  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewPhotos, setReviewPhotos] = useState([])

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setOrder(body.data)
        } else {
          setError(body.error || 'Order not found.')
        }
      })
      .catch(() => setError('Could not load order.'))
      .finally(() => setLoading(false))
  }, [orderId])

  async function copyOrderNumber() {
    if (!order) return
    try {
      await navigator.clipboard.writeText(order.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  function handleCancel() {
    if (!order) return
    if (!window.confirm('Cancel this order? This cannot be undone.')) return
    fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) setOrder(body.data)
        else alert(body.error || 'Failed to cancel order.')
      })
      .catch(() => alert('Network error.'))
  }

  function handleSubmitReview(item) {
    if (!reviewText.trim()) return
    // Wire to /api/reviews in production.
    // Photos are collected in reviewPhotos []; they can be uploaded to /api/upload
    // with the order+product metadata as part of a full review POST.
    setReviewing({ ...item, text: reviewText, rating: reviewRating, photos: reviewPhotos, submitted: true })
    setReviewText('')
    setReviewPhotos([])
  }

  if (loading) {
    return (
      <div className="container-page pb-20 pt-10 text-center">
        <Loader2 className="mx-auto h-10 w-10 text-bloom animate-spin" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted">Loading order…</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="container-page pb-20 pt-10 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-ivory/60 p-10">
          <Package className="mx-auto h-12 w-12 text-bloom" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl text-plum">Please log in</h1>
          <p className="mt-2 text-sm text-muted">Log in to view this order.</p>
          <Link href="/account/login" className="mt-5 inline-flex rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink transition">
            Log in
          </Link>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-page pb-20 pt-10 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-ivory/60 p-10">
          <AlertCircle className="mx-auto h-12 w-12 text-bloom" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl text-plum">Order not available</h1>
          <p className="mt-2 text-sm text-muted">{error || 'We could not find this order.'}</p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link href="/orders/me" className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink transition">
              My orders
            </Link>
            <Link href="/shop" className="rounded-full border border-plum/40 px-5 py-2.5 text-sm font-semibold text-plum hover:bg-plum/5 transition">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const meta = getStatusMeta(order.status)
  const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)
  const canReview = order.status === 'DELIVERED'

  return (
    <div className="container-page pb-24 pt-8 md:pt-12">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/orders/me" className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-plum">
          <ArrowLeft className="h-4 w-4" />
          All orders
        </Link>
      </div>

      {/* Header */}
      <div className="mt-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-3xl text-plum">{meta.label}</h1>
            <span className={['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', meta.bg, meta.color].join(' ')}>
              <span className={['h-1.5 w-1.5 rounded-full', meta.dot].join(' ')} />
              {order.status}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap text-sm">
            <span className="text-muted">Order</span>
            <button
              onClick={copyOrderNumber}
              className="inline-flex items-center gap-1 rounded-full bg-ivory/60 px-3 py-0.5 text-sm font-mono font-semibold text-plum hover:bg-ivory transition"
            >
              {order.orderNumber}
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {copied && <span className="text-xs text-sage font-semibold">Copied!</span>}
          </div>
          <p className="mt-1.5 text-xs text-muted flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-plum/40 px-4 py-2 text-sm font-semibold text-plum hover:bg-plum/5 transition"
            title="Save as PDF (Print dialog)"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Invoice
          </button>
          {canCancel && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-full border border-bloom/40 px-4 py-2 text-sm font-semibold text-bloom hover:bg-bloom/10 transition"
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      {/* Two-column */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Tracking */}
          <div className="paper-card p-6">
            <h2 className="font-display text-xl text-plum mb-5">Tracking</h2>
            <StatusTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="paper-card p-6">
            <h2 className="font-display text-xl text-plum mb-4">Items</h2>
            <ul className="divide-y divide-sand">
              {order.items?.map((item) => {
                const reviewOpen = reviewing?.productId === item.productId
                const reviewDone = reviewOpen && reviewing.submitted
                return (
                  <li key={item.id || item.productId} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="h-16 w-16 rounded-xl object-cover bg-ivory shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-sand flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-muted" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.productId}`} className="font-semibold text-plum hover:text-bloom transition">
                          {item.productName}
                        </Link>
                        <p className="text-xs text-muted">Qty: {item.quantity}</p>
                        <p className="mt-1 text-sm font-semibold text-plum">{formatPrice(item.lineTotal ?? item.unitPrice * item.quantity)}</p>

                        {/* Review block — only if delivered */}
                        {canReview && (
                          <div className="mt-3">
                            {!reviewOpen && !reviewDone && (
                              <button
                                onClick={() => setReviewing(item)}
                                className="text-xs font-semibold text-bloom hover:text-plum inline-flex items-center gap-1"
                              >
                                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                                Write a review
                              </button>
                            )}
                            {reviewOpen && !reviewDone && (
                              <div className="rounded-2xl border border-sand bg-ivory/50 p-3 space-y-2">
                              <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                      key={n}
                                      onClick={() => setReviewRating(n)}
                                      className="p-0.5"
                                      aria-label={`${n} stars`}
                                      role="radio"
                                      aria-checked={reviewRating === n}
                                    >
                                      <Star className={['h-5 w-5', n <= reviewRating ? 'text-bloom fill-bloom' : 'text-muted'].join(' ')} aria-hidden="true" />
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  rows={2}
                                  placeholder="Share your experience…"
                                  className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm text-plum placeholder:text-muted focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/30"
                                />
                                <div className="flex items-center gap-2 pt-1">
                                  <label
                                    htmlFor="review-photo"
                                    className="inline-flex items-center gap-1 rounded-full bg-ivory border border-sand px-2.5 py-1 text-xs font-semibold text-plum cursor-pointer hover:bg-ivory transition"
                                  >
                                    Add photo
                                    <input
                                      id="review-photo"
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || [])
                                        if (files.length) setReviewPhotos((prev) => [...prev, ...files])
                                      }}
                                    />
                                  </label>
                                  {reviewPhotos.length > 0 && (
                                    <span className="text-xs text-muted">{reviewPhotos.length} selected</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSubmitReview(item)}
                                    className="rounded-full bg-plum px-4 py-1.5 text-xs font-semibold text-cream hover:bg-ink transition"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => setReviewing(null)}
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-plum transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            {reviewDone && (
                              <p className="text-xs text-sage font-semibold">✓ Review submitted. Thank you!</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Address */}
          <div className="paper-card p-6">
            <h2 className="font-display text-xl text-plum mb-3">Delivery address</h2>
            {order.shippingAddress ? (
              <div className="flex gap-2 text-sm text-plum">
                <MapPin className="h-4 w-4 text-bloom shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{order.shippingAddress.fullName} · +91 {order.shippingAddress.mobileNumber}</p>
                  <p className="text-muted text-xs leading-relaxed">
                    {[order.shippingAddress.houseFlatBuilding, order.shippingAddress.areaStreet].filter(Boolean).join(', ')}
                    {order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ''}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pinCode}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">No address on file.</p>
            )}
          </div>

          {/* Shipping details */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <div className="paper-card p-6">
              <h2 className="font-display text-xl text-plum mb-3">Shipping details</h2>
              {order.trackingNumber ? (
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">Tracking number</span>
                    <span className="font-semibold text-plum font-mono">{order.trackingNumber}</span>
                  </div>
                  {order.shippingPartner && (
                    <div className="flex justify-between gap-3">
                      <span className="text-muted">Partner</span>
                      <span className="font-semibold text-plum">{order.shippingPartner}</span>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex justify-between gap-3">
                      <span className="text-muted">Est. delivery</span>
                      <span className="font-semibold text-plum">{order.estimatedDelivery}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">Tracking details will be shared here once your order ships.</p>
              )}
            </div>
          )}

          {/* Customer support */}
          <div className="paper-card p-6">
            <h2 className="font-display text-xl text-plum mb-3">Need help?</h2>
            <p className="text-sm text-muted">Our team is here for any questions about your order.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full border border-plum/40 px-4 py-2 text-sm font-semibold text-plum hover:bg-plum/5 transition"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Contact us
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 rounded-full border border-plum/40 px-4 py-2 text-sm font-semibold text-plum hover:bg-plum/5 transition"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT — sticky summary */}
        <aside>
          <div className="paper-card p-6 lg:sticky lg:top-6 space-y-4">
            <h2 className="font-display text-xl text-plum">Order summary</h2>

            <div className="space-y-1.5 text-sm">
              {order.subtotal != null && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-plum">{formatPrice(order.subtotal)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Discount</span>
                  <span className="font-semibold text-sage">−{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.fee > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">COD fee</span>
                  <span className="font-semibold text-plum">{formatPrice(order.fee)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-plum">{formatPrice(order.shipping)}</span>
                </div>
              )}
              <hr className="border-sand" />
              <div className="flex justify-between gap-3">
                <span className="font-medium text-plum">Total</span>
                <span className="font-display text-xl text-plum">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <hr className="border-sand" />

            <div className="space-y-1.5 text-sm">
              {order.paymentMethod && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Payment</span>
                  <span className="font-semibold text-plum">{order.paymentMethod}</span>
                </div>
              )}
              {order.paymentStatus && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Status</span>
                  <span className="font-semibold text-plum">{order.paymentStatus}</span>
                </div>
              )}
              {order.paymentReference && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted">Ref</span>
                  <span className="font-mono text-xs text-plum break-all max-w-[60%] text-right">{order.paymentReference}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="container-page pb-20 pt-10 text-center">
        <Loader2 className="mx-auto h-10 w-10 text-bloom animate-spin" aria-hidden="true" />
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  )
}
