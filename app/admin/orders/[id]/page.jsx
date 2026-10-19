'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAdminAccess } from '../../access-context'

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED']
const label = (value = '') => value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

export default function AdminOrderDetail() {
  const { can } = useAdminAccess()
  const canManage = can('orders.manage')
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [draft, setDraft] = useState({ trackingNumber: '', shippingPartner: '', estimatedDelivery: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not load order details.')
      setOrder(result.data)
      setDraft({ trackingNumber: result.data.trackingNumber || '', shippingPartner: result.data.shippingPartner || '', estimatedDelivery: result.data.estimatedDelivery || '' })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { if (id) load() }, [id])

  async function patchOrder(values) {
    setError(''); setNotice(''); setSaving(true)
    try {
      const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...values }) })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not update order.')
      setNotice('Order updated.')
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  async function updateRefund(refund, refundStatus) {
    setError(''); setNotice(''); setSaving(true)
    try {
      const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refundRequestId: refund.id, refundStatus }) })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not update refund request.')
      setNotice('Refund request updated.')
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  let address = order?.shippingAddress
  if (typeof address === 'string') { try { address = JSON.parse(address) } catch { address = { address } } }
  const addressParts = address && typeof address === 'object' ? {
    name: address.fullName || address.name,
    phone: address.mobileNumber || address.phone,
    house: address.houseFlatBuilding || address.addressLine1 || address.street,
    area: address.areaStreet || address.addressLine2 || address.area,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    pin: address.pinCode || address.postalCode || address.zip,
    country: address.country,
  } : {}

  if (loading) return <p role="status">Loading order details…</p>
  if (!order) return <section className="space-y-4"><p role="alert" className="rounded-xl bg-bloom/10 p-3 text-bloom">{error || 'Order not found.'}</p><Link href="/admin/orders" className="text-plum underline">Back to orders</Link></section>

  return <section className="min-w-0 space-y-5 sm:space-y-6">
    <Link href="/admin/orders" className="inline-flex min-h-10 items-center text-sm text-plum underline underline-offset-4">← Back to orders</Link>
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-sm text-muted">Order details</p><h1 className="break-all font-display text-2xl text-plum sm:text-3xl">{order.orderNumber}</h1><p className="mt-1 text-sm text-muted">Placed {new Date(order.createdAt).toLocaleString()}</p></div>{canManage ? <label className="text-sm font-medium text-plum">Fulfillment status<select aria-label="Fulfillment status" value={order.status} disabled={saving} onChange={(event) => patchOrder({ status: event.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-sand bg-white px-3 sm:w-auto">{STATUSES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label> : <span className="rounded-full bg-blush/40 px-3 py-2 text-sm text-plum">{label(order.status)}</span>}</header>
    {error && <p role="alert" className="rounded-xl bg-bloom/10 p-3 text-sm text-bloom">{error}</p>}{notice && <p role="status" className="rounded-xl bg-sage/20 p-3 text-sm">{notice}</p>}
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <div className="min-w-0 space-y-4">
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Items</h2><div className="mt-3 divide-y divide-sand">{order.items.map((item) => <div key={item.id} className="flex min-w-0 flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"><div className="min-w-0"><p className="break-words font-medium text-plum">{item.product.name}</p><p className="text-sm text-muted">Qty {item.quantity} · {money(item.unitPrice)} each{item.customization ? ` · ${item.customization}` : ''}</p><p className="text-xs text-muted">GST {item.gstPercent}% ({money(item.gstAmount)}) · COD fee {money(item.codFee)} · Other charge {money(item.otherCharge)}</p></div><strong className="shrink-0">{money(item.unitPrice * item.quantity + item.gstAmount + item.codFee + item.otherCharge)}</strong></div>)}</div></section>
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Customer and delivery</h2><dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted">Customer</dt><dd className="break-words font-medium">{order.customerName}</dd></div><div><dt className="text-muted">Email</dt><dd className="break-all font-medium">{order.customerEmail}</dd></div><div><dt className="text-muted">Phone</dt><dd className="break-words font-medium">{order.customerPhone || order.user?.phone || 'Not provided'}</dd></div><div><dt className="text-muted">Account type</dt><dd className="font-medium">{order.user ? 'Registered customer' : 'Guest order'}</dd></div></dl><div className="mt-4 border-t border-sand pt-3 text-sm"><p className="font-medium text-plum">Shipping address</p>{addressParts.house || addressParts.area || addressParts.city ? <div className="mt-2 space-y-1 break-words text-muted"><p className="font-medium text-ink">{addressParts.name || order.customerName}{addressParts.phone ? ` · ${addressParts.phone}` : ''}</p>{addressParts.house && <p>{addressParts.house}</p>}{addressParts.area && <p>{addressParts.area}</p>}{addressParts.landmark && <p>Near {addressParts.landmark}</p>}<p>{[addressParts.city, addressParts.state].filter(Boolean).join(', ')}{addressParts.pin ? ` — ${addressParts.pin}` : ''}</p>{addressParts.country && <p>{addressParts.country}</p>}</div> : <p className="mt-1 text-muted">No shipping address saved.</p>}</div></section>
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Shipping and tracking</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm text-muted">Shipping partner<input readOnly={!canManage} value={draft.shippingPartner} onChange={(event) => setDraft({ ...draft, shippingPartner: event.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-sand bg-white px-3 text-plum read-only:bg-ink/5" /></label><label className="text-sm text-muted">Tracking number<input readOnly={!canManage} value={draft.trackingNumber} onChange={(event) => setDraft({ ...draft, trackingNumber: event.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-sand bg-white px-3 text-plum read-only:bg-ink/5" /></label><label className="text-sm text-muted sm:col-span-2">Estimated delivery<input readOnly={!canManage} value={draft.estimatedDelivery} onChange={(event) => setDraft({ ...draft, estimatedDelivery: event.target.value })} placeholder="e.g. 3–5 business days" className="mt-1 min-h-11 w-full rounded-xl border border-sand bg-white px-3 text-plum read-only:bg-ink/5" /></label></div>{canManage && <button type="button" disabled={saving} onClick={() => patchOrder(draft)} className="mt-4 min-h-11 w-full rounded-xl bg-plum px-4 py-2 font-medium text-cream disabled:opacity-60 sm:w-auto">{saving ? 'Saving…' : 'Save tracking details'}</button>}</section>
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Refund requests</h2>{!order.refundRequests.length ? <p className="mt-2 text-sm text-muted">No refund requests for this order.</p> : <div className="mt-3 space-y-3">{order.refundRequests.map((refund) => <div key={refund.id} className="rounded-xl border border-sand bg-white p-3 sm:p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><strong className="text-plum">{label(refund.status)} · {money(refund.amount)}</strong>{canManage && !['COMPLETED', 'REJECTED'].includes(refund.status) && <select aria-label={`Refund status ${refund.id}`} disabled={saving} value={refund.status} onChange={(event) => updateRefund(refund, event.target.value)} className="min-h-11 w-full rounded-lg border border-sand px-3 sm:w-auto"><option value={refund.status} disabled>{label(refund.status)}</option>{({ REQUESTED: ['APPROVED', 'REJECTED'], APPROVED: ['PROCESSING', 'REJECTED'], PROCESSING: ['COMPLETED'] }[refund.status] || []).map((value) => <option key={value} value={value}>{label(value)}</option>)}</select>}</div><p className="mt-2 break-words text-sm text-muted">Refund UPI: {refund.refundUpiId || 'Not provided'}</p><p className="mt-1 break-words text-sm text-muted">{refund.reason}</p><p className="mt-1 text-xs text-muted">Requested {new Date(refund.createdAt).toLocaleString()}</p></div>)}</div>}</section>
      </div>
      <aside className="min-w-0 space-y-4">
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Price details</h2><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotal)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Discount</dt><dd>−{money(order.discount)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Shipping</dt><dd>{money(order.shipping)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Fees and charges</dt><dd>{money(order.fee)}</dd></div><div className="flex justify-between gap-3 border-t border-sand pt-3 font-semibold text-plum"><dt>Total</dt><dd>{money(order.totalAmount)}</dd></div></dl></section>
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Payment</h2><dl className="mt-3 space-y-3 break-words text-sm"><div><dt className="text-muted">Method</dt><dd className="font-medium">{order.paymentMethod || 'Not recorded'}</dd></div><div><dt className="text-muted">Status</dt><dd className="font-medium">{label(order.paymentStatus)}</dd></div><div><dt className="text-muted">Payment reference</dt><dd className="font-medium">{order.paymentReference || 'Not recorded'}</dd></div><div><dt className="text-muted">Order notes</dt><dd className="whitespace-pre-wrap">{order.notes || 'None'}</dd></div></dl></section>
        <section className="rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-5"><h2 className="font-display text-xl text-plum">Payment activity</h2>{order.paymentLogs.length ? <ul className="mt-3 space-y-3">{order.paymentLogs.map((log) => <li key={log.id} className="border-l-2 border-bloom pl-3 text-sm"><p className="font-medium text-plum">{label(log.status)} · {money(log.amount)}</p><p className="break-words text-xs text-muted">{log.method || log.provider || 'Payment'} · {new Date(log.createdAt).toLocaleString()}</p>{(log.utr || log.providerReference) && <p className="break-all text-xs text-muted">Reference: {log.utr || log.providerReference}</p>}</li>)}</ul> : <p className="mt-2 text-sm text-muted">No payment activity recorded.</p>}</section>
      </aside>
    </div>
  </section>
}
