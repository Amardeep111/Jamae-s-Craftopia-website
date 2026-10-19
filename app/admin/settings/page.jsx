'use client'

import { useEffect, useState } from 'react'
import { useAdminAccess } from '../access-context'

export default function AdminSettings() {
  const { can } = useAdminAccess()
  const canManage = can('settings.manage')
  const [form, setForm] = useState({ merchantVpa: '', merchantName: "Jamae's Craftopia", whatsappNumber: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' }).then(async (response) => {
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not load payment settings.')
      setForm({ merchantVpa: result.data.merchantVpa || '', merchantName: result.data.merchantName || "Jamae's Craftopia", whatsappNumber: result.data.whatsappNumber || '' })
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function save(event) {
    event.preventDefault(); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save settings.')
      setNotice('Payment settings saved. UPI details are now available to shoppers.')
    } catch (e) { setError(e.message) }
  }

  return <section className="max-w-2xl space-y-6"><header><h1 className="font-display text-3xl text-plum">Payment settings</h1><p className="mt-1 text-sm text-muted">Set the business payment destination shown in the UPI QR and WhatsApp follow-up.</p></header>
    {error && <p role="alert" className="rounded-xl bg-bloom/10 p-3 text-sm text-bloom">{error}</p>}{notice && <p role="status" className="rounded-xl bg-sage/20 p-3 text-sm">{notice}</p>}
    {loading ? <p role="status">Loading payment settings…</p> : <form onSubmit={save} className="space-y-4 rounded-2xl bg-cream p-6 shadow-soft ring-1 ring-sand">
      <label className="block text-sm font-medium text-plum">Merchant UPI ID<input required readOnly={!canManage} value={form.merchantVpa} onChange={(e) => setForm({ ...form, merchantVpa: e.target.value.trim() })} placeholder="business@bank" className="mt-2 w-full rounded-xl border border-sand bg-white px-4 py-3 read-only:bg-ink/5" /></label>
      <p className="-mt-2 text-xs text-muted">This is the destination account that receives customer payments.</p>
      <label className="block text-sm font-medium text-plum">Merchant name<input required readOnly={!canManage} value={form.merchantName} onChange={(e) => setForm({ ...form, merchantName: e.target.value })} className="mt-2 w-full rounded-xl border border-sand bg-white px-4 py-3 read-only:bg-ink/5" /></label>
      <label className="block text-sm font-medium text-plum">WhatsApp number, including country code<input readOnly={!canManage} value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="919876543210" className="mt-2 w-full rounded-xl border border-sand bg-white px-4 py-3 read-only:bg-ink/5" /></label>
      {canManage && <button className="rounded-full bg-plum px-5 py-3 font-semibold text-cream">Save settings</button>}
    </form>}
  </section>
}
