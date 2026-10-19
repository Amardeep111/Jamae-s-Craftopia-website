'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import { useAdminAccess } from '../access-context'
import Select from '@/components/ui/Select'

const statuses = [
  ['NEW', 'New'], ['REVIEWING', 'Reviewing'], ['QUOTED', 'Quote prepared'], ['ACCEPTED', 'Accepted'],
  ['IN_PROGRESS', 'In progress'], ['COMPLETED', 'Completed'], ['DECLINED', 'Declined'],
].map(([value, label]) => ({ value, label }))

export default function AdminCustomRequests() {
  const { can } = useAdminAccess()
  const canManage = can('customRequests.manage')
  const [requests, setRequests] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    setError('')
    try {
      const response = await fetch('/api/admin/custom-requests', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not load custom requests.')
      setRequests(result.data)
    } catch (cause) { setError(cause.message || 'Could not load custom requests.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function update(id, patch) {
    setRequests((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  async function save(item) {
    setSavingId(item.id); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/custom-requests', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: item.status, quotedPrice: item.quotedPrice ?? '', adminNotes: item.adminNotes || '' }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save this request.')
      update(item.id, result.data)
      setNotice(`Request from ${item.name} updated.`)
    } catch (cause) { setError(cause.message || 'Could not save this request.') }
    finally { setSavingId('') }
  }

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return requests
    return requests.filter((item) => [item.name, item.contact, item.idea, item.category, item.status].some((part) => String(part || '').toLowerCase().includes(value)))
  }, [requests, query])

  return <section className="space-y-5">
    <header><h1 className="font-display text-3xl text-plum">Custom requests</h1><p className="mt-1 text-sm text-muted">Review customer ideas, reference photos, and follow-up details.</p></header>
    {error && <p role="alert" className="rounded-xl bg-bloom/10 p-3 text-sm text-bloom">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-sage/20 p-3 text-sm text-plum">{notice}</p>}
    <label className="block max-w-lg text-sm text-muted">Search requests<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, contact, idea, or status" className="mt-1.5 min-h-11 w-full rounded-xl border border-sand bg-white px-3 text-sm text-plum" /></label>
    {loading ? <p role="status">Loading custom requests…</p> : filtered.length === 0 ? <div className="rounded-2xl bg-cream p-8 text-center shadow-soft ring-1 ring-sand"><h2 className="font-display text-xl text-plum">{requests.length ? 'No requests match' : 'No custom requests yet'}</h2><p className="mt-2 text-sm text-muted">New custom order ideas will appear here.</p></div> : <div className="space-y-4">{filtered.map((item) => <article key={item.id} className="min-w-0 space-y-4 rounded-2xl bg-cream p-4 shadow-soft ring-1 ring-sand sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-display text-xl text-plum">{item.idea}</h2><p className="mt-1 text-xs text-muted">Received {new Date(item.createdAt).toLocaleString()} · {item.category || 'No category'}{item.quotedPrice ? ` · Price quote ₹${Number(item.quotedPrice).toLocaleString('en-IN')}` : ''}</p></div><span className="rounded-full bg-plum/10 px-3 py-1 text-xs font-semibold text-plum">{statuses.find((status) => status.value === item.status)?.label || item.status}</span></div>
      <dl className="grid gap-3 border-y border-sand py-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted">Customer</dt><dd className="font-medium text-plum">{item.name}</dd></div><div><dt className="text-xs text-muted">Reply to</dt><dd className="break-all font-medium text-plum">{item.contact}</dd></div><div><dt className="text-xs text-muted">Colours</dt><dd>{item.colors || 'Not specified'}</dd></div><div><dt className="text-xs text-muted">Budget · Occasion</dt><dd>{[item.budget, item.occasion].filter(Boolean).join(' · ') || 'Not specified'}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-muted">Details</dt><dd className="whitespace-pre-wrap">{item.details}</dd></div></dl>
      {item.referenceImages?.length > 0 ? <div><h3 className="flex items-center gap-2 text-sm font-semibold text-plum"><ImageIcon className="h-4 w-4" /> Reference photos</h3><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{item.referenceImages.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-xl border border-sand bg-white"><img src={url} alt={`Customer reference ${index + 1}`} className="h-full w-full object-cover transition group-hover:scale-105" /><span className="absolute bottom-2 right-2 rounded-full bg-white/95 p-2 text-plum shadow"><ExternalLink className="h-3.5 w-3.5" /></span></a>)}</div></div> : <p className="text-xs text-muted">No reference photos attached.</p>}
      {canManage && <div className="grid items-end gap-3 border-t border-sand pt-4 sm:grid-cols-[13rem_9rem_minmax(0,1fr)_auto]"><div><Select label="Request status" options={statuses} value={item.status} onChange={(value) => update(item.id, { status: value })} /></div><label className="block text-sm font-medium text-plum">Price (₹)<input type="number" min="1" max="10000000" step="1" value={item.quotedPrice ?? ''} onChange={(event) => update(item.id, { quotedPrice: event.target.value === '' ? '' : Number(event.target.value) })} placeholder="Required to accept" className="mt-1.5 min-h-11 w-full rounded-xl border border-sand bg-white px-3 text-sm" /></label><label className="block text-sm font-medium text-plum">Internal notes<textarea maxLength={2000} rows={2} value={item.adminNotes || ''} onChange={(event) => update(item.id, { adminNotes: event.target.value })} placeholder="Private follow-up notes" className="mt-1.5 w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm" /></label><button type="button" disabled={savingId === item.id} onClick={() => save(item)} className="min-h-11 rounded-full bg-plum px-5 text-sm font-semibold text-cream disabled:opacity-60">{savingId === item.id ? 'Saving…' : 'Save update'}</button><p className="text-xs leading-5 text-muted sm:col-span-4">Accepting sends the customer an email with this price and payment instructions. Declining sends a separate update email.</p></div>}
    </article>)}</div>}
  </section>
}
