'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react'
import CheckoutProgress from '@/components/checkout/CheckoutProgress'
import PaymentMethodList from './PaymentMethodList'
import UpiForm from './UpiForm'
import CardForm from './CardForm'
import NetBankingForm from './NetBankingForm'
import CodForm from './CodForm'
import PaymentSummary from './PaymentSummary'
import PaymentResult from './PaymentResult'
import { PAYMENT_METHODS, PAYMENT_METHOD_ORDER } from '@/lib/payment'
import { couponDiscountAmount } from '@/lib/coupon'
import { useCartStore } from '@/lib/cart'
import { useCouponStore } from '@/lib/coupon'
import { useAddressStore } from '@/lib/address'
import { useUserStore } from '@/lib/user'
import usePayment from '@/hooks/usePayment'
import { COD_FEE, methodHasFee } from '@/lib/paymentFees'

export default function PaymentPage() {
  const router = useRouter()

  // ── Cart ────────────────────────────────────────────────────────────────
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // ── Coupon ──────────────────────────────────────────────────────────────
  const coupon = useCouponStore((s) => s.coupon)
  const discount = couponDiscountAmount(coupon, subtotal)

  // ── Address ─────────────────────────────────────────────────────────────
  const selectedAddress = useAddressStore((s) => s.getSelectedAddress())

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authEmail = useUserStore((s) => s.email)
  const authUserId = useUserStore((s) => s.userId)

  // ── Payment state ────────────────────────────────────────────────────────
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [submitState, setSubmitState] = useState('form') // 'form' | 'processing' | 'success' | 'failure'
  const [orderResult, setOrderResult] = useState(null)
  const [failureMessage, setFailureMessage] = useState('')
  // Idempotency guard — prevent duplicate orders on double-click / network retry.
  const [inFlight, setInFlight] = useState(false)

  // ── Fee ─────────────────────────────────────────────────────────────────
  const codFee = methodHasFee('cod') ? COD_FEE : 0
  const codTotal = subtotal - discount + codFee
  const currentFee = selectedMethod === 'cod' ? codFee : 0

  // ── Payment service ──────────────────────────────────────────────────────
  const { loading, error, initialize, confirm, createOrder } = usePayment()

  // ── Guard: empty cart ────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-page pb-20 pt-10 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-ivory/60 p-10">
          <p className="font-display text-2xl text-plum">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted">Add something to your bag before checking out.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream">
            Browse the shop
          </Link>
        </div>
      </div>
    )
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  async function handleSubmit(details) {
    // Idempotency: ignore if already processing / completed.
    if (inFlight || submitState === 'processing' || submitState === 'success') return
    setInFlight(true)
    setSubmitState('processing')

    try {
      // COD: no online payment verification needed. Create order directly.
      if (selectedMethod === 'cod') {
        if (!selectedAddress || !selectedAddress.fullName) {
          setInFlight(false)
          setSubmitState('failure')
          setFailureMessage('Please add a delivery address before placing your COD order.')
          return
        }
        const orderData = {
          customerName: selectedAddress?.fullName || authEmail?.split('@')[0] || '',
          customerEmail: selectedAddress?.email || authEmail || '',
          customerPhone: selectedAddress?.mobileNumber || '',
          shippingAddress: { ...selectedAddress, userId: authUserId || null },
          totalAmount: codTotal,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'COD_PENDING_COLLECTION',
          status: 'CONFIRMED',
          items: items.map((i) => ({
            productId: i.id,
            productName: i.name,
            unitPrice: i.price,
            quantity: i.quantity,
          })),
          notes: 'Payment method: COD | Pay on delivery',
        }

        const order = await createOrder(orderData)
        const orderNumber = order?.orderNumber || order?.id

        clearCart()

        // Persist the most recent order so the success page can render without
        // a follow-up round-trip — but always redirect, never stay on
        // "Processing payment…".
        try {
          if (orderNumber) {
            window.sessionStorage.setItem('jamaes:lastOrderNumber', orderNumber)
            window.sessionStorage.setItem(
              `jamaes:order:${orderNumber}`,
              JSON.stringify({
                orderId: order?.id,
                orderNumber,
                amount: codTotal,
                method: 'Cash on Delivery',
                address: selectedAddress,
                testMode: false,
                paymentStatus: 'COD_PENDING_COLLECTION',
                status: 'CONFIRMED',
              })
            )
          }
        } catch {
          /* session storage may be unavailable; redirect anyway */
        }

        setInFlight(false)

        // Hard redirect so we leave the payment page entirely.
        if (orderNumber) {
          window.location.href = `/checkout/success?order=${encodeURIComponent(orderNumber)}`
        } else {
          window.location.href = '/orders/me'
        }
        return
      }

      // All other methods: initialize + confirm + create (existing flow)
      const initResult = await initialize({
        method: selectedMethod,
        details,
        amount: codTotal,
        currency: 'INR',
      })

      let confirmed
      try {
        confirmed = await confirm({
          method: selectedMethod,
          providerReference: initResult.providerReference,
          details,
        })
      } catch (verifyError) {
        if (initResult.testMode) {
          confirmed = { verified: false, status: 'test', testMode: true }
        } else {
          throw verifyError
        }
      }

      const orderData = {
        customerName: selectedAddress?.fullName || '',
        customerEmail: selectedAddress?.email || '',
        customerPhone: selectedAddress?.mobileNumber || '',
        shippingAddress: selectedAddress || null,
        totalAmount: codTotal,
        paymentMethod: PAYMENT_METHODS[selectedMethod]?.label || selectedMethod,
        paymentStatus: initResult.testMode ? 'PAID' : 'PAID',
        paymentReference: initResult.providerReference,
        status: 'CONFIRMED',
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
        notes: `Payment method: ${selectedMethod} | Provider ref: ${initResult.providerReference}`,
      }

      const order = await createOrder(orderData)

      setOrderResult({
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        amount: codTotal,
        method: PAYMENT_METHODS[selectedMethod]?.label || selectedMethod,
        address: selectedAddress,
        testMode: initResult.testMode,
      })

      clearCart()
      setInFlight(false)
      setSubmitState('success')
    } catch (e) {
      setInFlight(false)
      setFailureMessage(e.message || 'Payment could not be completed. Please try again.')
      setSubmitState('failure')
    }
  }

  // ── Payment form for selected method ─────────────────────────────────────
  function renderForm() {
    // COD needs the inFlight guard; other methods use the usePayment loading state.
    const isLoading = selectedMethod === 'cod' ? inFlight : loading
    const props = {
      total: codTotal,
      fee: currentFee,
      testMode: true, // Always test mode since no real gateway is wired yet.
      onSubmit: handleSubmit,
      loading: isLoading,
      error,
    }
    switch (selectedMethod) {
      case 'upi':     return <UpiForm {...props} />
      case 'card':    return <CardForm {...props} />
      case 'net_banking': return <NetBankingForm {...props} />
      case 'cod':     return <CodForm {...props} />
      default:        return null
    }
  }

  // ── Continue shopping (from success or failure) ───────────────────────────
  function handleContinueShopping() {
    router.push('/shop')
  }

  function handleViewOrder() {
    const num = orderResult?.orderNumber
    if (num) router.push(`/checkout/success?order=${encodeURIComponent(num)}`)
    else router.push('/orders/me')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container-page pb-24 pt-8 md:pt-12">
      {/* Progress */}
      <CheckoutProgress current="payment" />

      {/* Back nav */}
      <div className="mt-5 flex items-center gap-3">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-plum"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to order summary
        </Link>
      </div>

      <h1 className="mt-4 font-display text-3xl text-plum">Payment</h1>

      {/* ── Two-column layout (desktop) ───────────────────────────────────── */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* ── LEFT: payment methods + form ─────────────────────────────── */}
        <section aria-label="Payment">
          {submitState === 'form' ? (
            <>
              <div className="paper-card p-5 sm:p-6">
                <h2 className="font-display text-xl text-plum mb-4">Payment Methods</h2>
                <PaymentMethodList selected={selectedMethod} onSelect={setSelectedMethod} />
              </div>

              {/* Selected method form */}
              {selectedMethod && (
                <div className="paper-card mt-4 p-5 sm:p-6">
                  <h2 className="font-display text-xl text-plum mb-5">
                    {PAYMENT_METHODS[selectedMethod]?.label}
                  </h2>
                  {renderForm()}
                </div>
              )}

              {/* Security badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted/70">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Your payment is protected. We never store card details.</span>
              </div>
            </>
          ) : (
            <PaymentResult
              variant={submitState === 'processing' ? 'processing' : submitState}
              result={orderResult}
              errorMessage={failureMessage}
              onRetry={() => setSubmitState('form')}
              onContinueShopping={handleContinueShopping}
              onViewOrder={handleViewOrder}
            />
          )}
        </section>

        {/* ── RIGHT: order summary ─────────────────────────────────────── */}
        <section aria-label="Order summary" className="lg:sticky lg:top-6 lg:self-start">
          <PaymentSummary method={selectedMethod} fee={currentFee} />
        </section>
      </div>
    </div>
  )
}
