'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, RefreshCw, ArrowRight, ShoppingBag } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/data/products'

/**
 * Renders a payment result state: success, failure, or processing.
 * The "success" and "failure" variants each show a single primary action;
 * "processing" is non-interactive and prevents the user from resubmitting.
 */
export default function PaymentResult({
  variant, // 'processing' | 'success' | 'failure'
  onRetry, // () => void — bring the user back to the form
  onContinueShopping, // () => void
  onViewOrder, // () => void
  result, // { orderId, orderNumber, amount, method, address, testMode } | null
  errorMessage, // string | null
}) {
  if (variant === 'processing') return <Processing />
  if (variant === 'success') return <Success result={result} onContinueShopping={onContinueShopping} onViewOrder={onViewOrder} />
  return <Failure message={errorMessage} onRetry={onRetry} onContinueShopping={onContinueShopping} />
}

function Processing() {
  return (
    <div className="paper-card p-8 sm:p-12 text-center" role="status" aria-live="polite">
      <Loader2 className="mx-auto h-12 w-12 text-bloom animate-spin" aria-hidden="true" />
      <h2 className="mt-5 font-display text-2xl text-plum">Processing payment…</h2>
      <p className="mt-2 text-sm text-muted">Please don't close or refresh this page.</p>
    </div>
  )
}

function Success({ result, onContinueShopping, onViewOrder }) {
  const { orderNumber, amount, method, address, testMode, paymentStatus } = result || {}
  const isCod = method === 'Cash on Delivery'
  const est = '3–5 days'
  const paymentLabel = isCod ? 'Pay on Delivery' : method
  const paymentSubtitle = isCod ? 'Payment due at delivery — no online payment needed.' : (testMode ? 'Test mode — no real payment processed.' : 'Payment confirmed.')

  return (
    <div className="paper-card p-8 sm:p-12 text-center" role="status" aria-live="polite">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/30 text-sage">
        <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-display text-3xl text-plum">{isCod ? 'Order Placed!' : 'Payment Successful'}</h2>
      <p className="mt-1 text-sm text-muted">{isCod ? 'Thank you for choosing Cash on Delivery.' : 'Your order has been confirmed.'}</p>

      {testMode && !isCod && (
        <div className="mt-4 mx-auto max-w-md rounded-xl bg-peach/30 border border-peach/50 p-3 text-sm text-plum">
          <strong>Test mode.</strong> No real payment was processed.
        </div>
      )}

      {isCod && (
        <div className="mt-4 mx-auto max-w-md rounded-xl bg-sage/10 border border-sage/40 p-4 text-sm text-plum text-left">
          <p className="font-semibold text-sage">✓ Order confirmed — pay on delivery</p>
          <p className="mt-1 text-muted">A delivery partner will bring your order. Please keep <strong>₹{formatPrice(amount)}</strong> ready in cash.</p>
        </div>
      )}

      <dl className="mt-6 mx-auto max-w-md grid grid-cols-1 gap-2 text-sm text-left rounded-2xl bg-ivory/70 p-5">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Order ID</dt>
          <dd className="font-semibold text-plum break-all">{orderNumber || '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{isCod ? 'Amount due on delivery' : 'Amount paid'}</dt>
          <dd className="font-semibold text-plum">{amount != null ? formatPrice(amount) : '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Payment method</dt>
          <dd className="font-semibold text-plum">{method || '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Payment status</dt>
          <dd className="font-semibold text-plum">{isCod ? 'Pay on Delivery' : (paymentStatus || (testMode ? 'Test mode' : 'Paid'))}</dd>
        </div>
        {address && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Deliver to</dt>
            <dd className="font-semibold text-plum text-right max-w-[60%]">
              {address.fullName}
              <br />
              <span className="text-muted font-normal text-xs">{address.city}, {address.state}</span>
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Estimated delivery</dt>
          <dd className="font-semibold text-plum">{est}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button onClick={onViewOrder} variant="primary" size="md">
          View order <ArrowRight className="h-4 w-4" />
        </Button>
        <Button onClick={onContinueShopping} variant="secondary" size="md">
          <ShoppingBag className="h-4 w-4" />
          Continue shopping
        </Button>
      </div>
    </div>
  )
}

function Failure({ message, onRetry, onContinueShopping }) {
  return (
    <div className="paper-card p-8 sm:p-12 text-center" role="status" aria-live="polite">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bloom/10 text-bloom">
        <XCircle className="h-9 w-9" aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-display text-2xl text-plum">Payment could not be completed</h2>
      <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
        {message || 'Please try again, or choose another payment method. Your cart, address and coupon are preserved.'}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button onClick={onRetry} variant="primary" size="md">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button onClick={onContinueShopping} variant="secondary" size="md">
          Continue shopping
        </Button>
      </div>
    </div>
  )
}