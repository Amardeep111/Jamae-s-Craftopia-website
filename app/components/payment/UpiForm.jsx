'use client'

import { useState } from 'react'
import { Smartphone, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { validateUpiId } from '@/lib/payment'
import { formatPrice } from '@/data/products'

export default function UpiForm({ total, testMode, onSubmit, loading, error }) {
  const [upiId, setUpiId] = useState('')
  const [upiError, setUpiError] = useState('')
  const [touched, setTouched] = useState(false)

  function handleBlur() {
    setTouched(true)
    setUpiError(validateUpiId(upiId))
  }

  function handleChange(e) {
    const raw = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '')
    setUpiId(raw)
    if (touched) setUpiError(validateUpiId(raw))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validateUpiId(upiId)
    setTouched(true)
    setUpiError(err)
    if (err) return
    onSubmit({ upiId: upiId.trim() })
  }

  const isValid = !validateUpiId(upiId)

  return (
    <div>
      {testMode && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-peach/30 border border-peach/50 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-bloom shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-plum">
            <strong>Test mode.</strong> Use any valid-format UPI ID, e.g. <em>yourname@upi</em>. No real payment will be processed.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="UPI ID / VPA"
          placeholder="yourname@upi"
          value={upiId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={upiError}
          autoComplete="off"
          inputMode="email"
          aria-describedby={upiError ? 'upi-error' : undefined}
        />

        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Works with any UPI app — GPay, PhonePe, Paytm, BHIM and more</span>
        </div>

        {error && (
          <p className="mt-3 text-sm text-bloom" role="alert">{error}</p>
        )}

        <div className="mt-5">
          <Button
            type="submit"
            disabled={loading || !isValid}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing…' : `Pay ${formatPrice(total)} securely`}
          </Button>
        </div>
      </form>
    </div>
  )
}