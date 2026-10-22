'use client'

import { useEffect, useState } from 'react'
import {
  MapPin, Phone, Mail, MessageCircle,
  CreditCard, Store, Check, ExternalLink, Globe, Sparkles
} from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/SocialIcons'
import { useAdminAccess } from '../access-context'

function VisibilityBadge({ isVisible, onToggle, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!isVisible)}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
        isVisible
          ? 'bg-moss/10 text-moss ring-1 ring-moss/30 hover:bg-moss/20'
          : 'bg-muted/15 text-muted ring-1 ring-sand hover:bg-sand/40'
      } disabled:opacity-50`}
      title={isVisible ? 'Click to hide from website' : 'Click to show on website'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isVisible ? 'bg-moss' : 'bg-muted'}`} />
      <span>{isVisible ? 'Visible on site' : 'Hidden from site'}</span>
    </button>
  )
}

export default function AdminSettings() {
  const { can } = useAdminAccess()
  const canManage = can('settings.manage')

  const [activeTab, setActiveTab] = useState('contact') // 'contact' | 'payment'

  // Contact & Social form state
  const [siteForm, setSiteForm] = useState({
    name: "Jamae's Craftopia",
    tagline: 'Handmade with love, created especially for you.',
    location: 'Siliguri, West Bengal, India',
    email: 'hello@jamaescraftopia.com',
    phone: '+91 98XXX XXXXX',
    whatsapp: 'https://wa.me/910000000000',
    social: {
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
    },
    visibility: {
      location: true,
      email: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      facebook: true,
    },
  })

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    merchantVpa: '',
    merchantName: "Jamae's Craftopia",
    whatsappNumber: '',
  })

  const [siteLoading, setSiteLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(true)
  const [siteSaving, setSiteSaving] = useState(false)
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Load site contact & social settings
  useEffect(() => {
    let active = true
    fetch('/api/admin/site', { cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json()
        if (active && json.success && json.data) {
          setSiteForm((prev) => ({
            ...prev,
            ...json.data,
            social: { ...prev.social, ...(json.data.social || {}) },
            visibility: { ...prev.visibility, ...(json.data.visibility || {}) },
          }))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSiteLoading(false)
      })
    return () => { active = false }
  }, [])

  // Load payment settings
  useEffect(() => {
    let active = true
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json()
        if (active && response.ok && result.success && result.data) {
          setPaymentForm({
            merchantVpa: result.data.merchantVpa || '',
            merchantName: result.data.merchantName || "Jamae's Craftopia",
            whatsappNumber: result.data.whatsappNumber || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setPaymentLoading(false)
      })
    return () => { active = false }
  }, [])

  async function saveSite(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSiteSaving(true)
    try {
      const res = await fetch('/api/admin/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteForm),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save site settings.')
      setNotice('Store contact, location, and social links updated! The changes are now live across the website without requiring any code deploy.')
    } catch (err) {
      setError(err.message || 'Could not save settings.')
    } finally {
      setSiteSaving(false)
    }
  }

  async function savePayment(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setPaymentSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save payment settings.')
      setNotice('Payment settings saved. UPI details are now updated for checkout.')
    } catch (e) {
      setError(e.message)
    } finally {
      setPaymentSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-plum">Store & Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Manage contact information, Instagram/Facebook handles, location, and payment destinations dynamically.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-sand gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab('contact'); setError(''); setNotice('') }}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'contact'
              ? 'border-plum text-plum'
              : 'border-transparent text-muted hover:text-plum'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Contact & Social Media</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('payment'); setError(''); setNotice('') }}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'payment'
              ? 'border-plum text-plum'
              : 'border-transparent text-muted hover:text-plum'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment & UPI</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-2xl border border-moss/20 bg-moss/10 p-4 text-sm text-moss font-medium">
          {notice}
        </div>
      )}

      {/* ================= TAB 1: CONTACT & SOCIAL MEDIA ================= */}
      {activeTab === 'contact' && (
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main Edit Form */}
          <div className="lg:col-span-3">
            {siteLoading ? (
              <p role="status" className="text-sm text-muted">Loading store settings…</p>
            ) : (
              <form onSubmit={saveSite} className="space-y-6 rounded-3xl bg-cream p-6 shadow-soft ring-1 ring-sand">
                {/* Store Identity */}
                <div className="space-y-4">
                  <h2 className="font-display text-lg text-plum flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-bloom" />
                    Store Identity
                  </h2>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Store Name
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={!canManage}
                      value={siteForm.name}
                      onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                      placeholder="Jamae's Craftopia"
                      className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Tagline / Footer Note
                    </label>
                    <input
                      type="text"
                      readOnly={!canManage}
                      value={siteForm.tagline}
                      onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                      placeholder="Handmade with love, created especially for you."
                      className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                    />
                  </div>
                </div>

                <hr className="border-sand/60" />

                {/* Location & Contact */}
                <div className="space-y-4">
                  <h2 className="font-display text-lg text-plum flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-bloom" />
                    Location & Direct Reach
                  </h2>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Workshop Location / City
                      </label>
                      <VisibilityBadge
                        isVisible={siteForm.visibility?.location !== false}
                        disabled={!canManage}
                        onToggle={(val) =>
                          setSiteForm({
                            ...siteForm,
                            visibility: { ...siteForm.visibility, location: val },
                          })
                        }
                      />
                    </div>
                    <input
                      type="text"
                      required
                      readOnly={!canManage}
                      value={siteForm.location}
                      onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })}
                      placeholder="Siliguri, West Bengal, India"
                      className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                    />
                    <p className="mt-1 text-xs text-muted">Displayed in the Footer, Contact page, and About page.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                          Mobile / Phone Number
                        </label>
                        <VisibilityBadge
                          isVisible={siteForm.visibility?.phone !== false}
                          disabled={!canManage}
                          onToggle={(val) =>
                            setSiteForm({
                              ...siteForm,
                              visibility: { ...siteForm.visibility, phone: val },
                            })
                          }
                        />
                      </div>
                      <input
                        type="text"
                        readOnly={!canManage}
                        value={siteForm.phone}
                        onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                        placeholder="+91 98XXX XXXXX"
                        className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                          Contact Email
                        </label>
                        <VisibilityBadge
                          isVisible={siteForm.visibility?.email !== false}
                          disabled={!canManage}
                          onToggle={(val) =>
                            setSiteForm({
                              ...siteForm,
                              visibility: { ...siteForm.visibility, email: val },
                            })
                          }
                        />
                      </div>
                      <input
                        type="email"
                        readOnly={!canManage}
                        value={siteForm.email}
                        onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })}
                        placeholder="hello@jamaescraftopia.com"
                        className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        WhatsApp Chat Link or Number
                      </label>
                      <VisibilityBadge
                        isVisible={siteForm.visibility?.whatsapp !== false}
                        disabled={!canManage}
                        onToggle={(val) =>
                          setSiteForm({
                            ...siteForm,
                            visibility: { ...siteForm.visibility, whatsapp: val },
                          })
                        }
                      />
                    </div>
                    <input
                      type="text"
                      readOnly={!canManage}
                      value={siteForm.whatsapp}
                      onChange={(e) => setSiteForm({ ...siteForm, whatsapp: e.target.value })}
                      placeholder="https://wa.me/919876543210 or 919876543210"
                      className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                    />
                    <p className="mt-1 text-xs text-muted">Used for the WhatsApp quick chat button on the Contact page.</p>
                  </div>
                </div>

                <hr className="border-sand/60" />

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h2 className="font-display text-lg text-plum flex items-center gap-2">
                    <Globe className="h-4 w-4 text-bloom" />
                    Social Media Channels
                  </h2>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        <InstagramIcon className="h-3.5 w-3.5 text-bloom" />
                        Instagram Profile URL
                      </label>
                      <VisibilityBadge
                        isVisible={siteForm.visibility?.instagram !== false}
                        disabled={!canManage}
                        onToggle={(val) =>
                          setSiteForm({
                            ...siteForm,
                            visibility: { ...siteForm.visibility, instagram: val },
                          })
                        }
                      />
                    </div>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="url"
                        readOnly={!canManage}
                        value={siteForm.social?.instagram || ''}
                        onChange={(e) =>
                          setSiteForm({
                            ...siteForm,
                            social: { ...siteForm.social, instagram: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/jamaescraftopia"
                        className="flex-1 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                      />
                      {siteForm.social?.instagram && (
                        <a
                          href={siteForm.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-sand bg-white px-3 py-2 text-xs font-semibold text-plum hover:bg-blush"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Test</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        <FacebookIcon className="h-3.5 w-3.5 text-bloom" />
                        Facebook Page URL
                      </label>
                      <VisibilityBadge
                        isVisible={siteForm.visibility?.facebook !== false}
                        disabled={!canManage}
                        onToggle={(val) =>
                          setSiteForm({
                            ...siteForm,
                            visibility: { ...siteForm.visibility, facebook: val },
                          })
                        }
                      />
                    </div>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="url"
                        readOnly={!canManage}
                        value={siteForm.social?.facebook || ''}
                        onChange={(e) =>
                          setSiteForm({
                            ...siteForm,
                            social: { ...siteForm.social, facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/jamaescraftopia"
                        className="flex-1 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-plum read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                      />
                      {siteForm.social?.facebook && (
                        <a
                          href={siteForm.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-sand bg-white px-3 py-2 text-xs font-semibold text-plum hover:bg-blush"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Test</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={siteSaving}
                      className="rounded-full bg-plum px-6 py-3 font-semibold text-cream shadow-soft transition hover:bg-ink disabled:opacity-60"
                    >
                      {siteSaving ? 'Saving changes…' : 'Save store & contact details'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Live Storefront Preview
            </h2>

            {/* Footer "Find us" Card Preview */}
            <div className="rounded-3xl border border-sand bg-ivory/80 p-5 shadow-soft">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-bloom">
                Footer Widget Preview
              </span>
              <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-plum">
                Find us
              </h3>
              {siteForm.visibility?.location !== false && siteForm.location ? (
                <p className="mt-3 flex items-start gap-2 text-xs text-muted">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bloom" />
                  <span>{siteForm.location}</span>
                </p>
              ) : siteForm.location ? (
                <p className="mt-3 text-xs text-muted/50 italic line-through">Location hidden</p>
              ) : null}
              {siteForm.visibility?.email !== false && siteForm.email ? (
                <p className="mt-1 text-xs text-muted">{siteForm.email}</p>
              ) : siteForm.email ? (
                <p className="mt-1 text-xs text-muted/50 italic line-through">Email hidden</p>
              ) : null}
              {siteForm.visibility?.phone !== false && siteForm.phone ? (
                <p className="mt-1 text-xs text-muted">{siteForm.phone}</p>
              ) : siteForm.phone ? (
                <p className="mt-1 text-xs text-muted/50 italic line-through">Phone hidden</p>
              ) : null}
              <div className="mt-3 flex gap-2">
                {siteForm.visibility?.instagram !== false && siteForm.social?.instagram && (
                  <span className="rounded-full bg-cream p-1.5 text-plum ring-1 ring-sand/40" title="Instagram visible">
                    <InstagramIcon className="h-4 w-4" />
                  </span>
                )}
                {siteForm.visibility?.facebook !== false && siteForm.social?.facebook && (
                  <span className="rounded-full bg-cream p-1.5 text-plum ring-1 ring-sand/40" title="Facebook visible">
                    <FacebookIcon className="h-4 w-4" />
                  </span>
                )}
                {siteForm.visibility?.whatsapp !== false && siteForm.whatsapp && (
                  <span className="rounded-full bg-cream p-1.5 text-plum ring-1 ring-sand/40" title="WhatsApp visible">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>

            {/* Contact Page Aside Card Preview */}
            <div className="rounded-3xl border border-sand bg-white p-5 shadow-soft">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-bloom">
                Contact Page Preview
              </span>
              <div className="mt-3 space-y-2 text-xs text-muted">
                {siteForm.visibility?.location !== false && siteForm.location && (
                  <div className="flex items-center gap-2 font-medium text-plum">
                    <MapPin className="h-3.5 w-3.5 text-bloom" />
                    <span>{siteForm.location}</span>
                  </div>
                )}
                {siteForm.visibility?.email !== false && siteForm.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-bloom" />
                    <span>{siteForm.email}</span>
                  </div>
                )}
                {siteForm.visibility?.phone !== false && siteForm.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-bloom" />
                    <span>{siteForm.phone}</span>
                  </div>
                )}
                {siteForm.visibility?.whatsapp !== false && siteForm.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-bloom" />
                    <span>WhatsApp: {siteForm.whatsapp}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-sand/60 bg-cream/50 p-4 text-xs text-muted">
              💡 <strong>Instant effect:</strong> Changes saved here immediately update the website footer, contact cards, and customer links without redeploying code.
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PAYMENT & UPI ================= */}
      {activeTab === 'payment' && (
        <div className="max-w-2xl">
          {paymentLoading ? (
            <p role="status" className="text-sm text-muted">Loading payment settings…</p>
          ) : (
            <form onSubmit={savePayment} className="space-y-4 rounded-3xl bg-cream p-6 shadow-soft ring-1 ring-sand">
              <header className="mb-2">
                <h2 className="font-display text-xl text-plum">Payment destination</h2>
                <p className="mt-1 text-xs text-muted">
                  Configure the recipient UPI ID and verification destination used during customer checkout.
                </p>
              </header>

              <label className="block text-sm font-medium text-plum">
                Merchant UPI ID
                <input
                  required
                  readOnly={!canManage}
                  value={paymentForm.merchantVpa}
                  onChange={(e) => setPaymentForm({ ...paymentForm, merchantVpa: e.target.value.trim() })}
                  placeholder="business@bank"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                />
              </label>
              <p className="-mt-2 text-xs text-muted">
                Destination account that receives customer payments via QR code.
              </p>

              <label className="block text-sm font-medium text-plum">
                Merchant name
                <input
                  required
                  readOnly={!canManage}
                  value={paymentForm.merchantName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, merchantName: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                />
              </label>

              <label className="block text-sm font-medium text-plum">
                WhatsApp number for payment screenshot confirmation
                <input
                  readOnly={!canManage}
                  value={paymentForm.whatsappNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, whatsappNumber: e.target.value })}
                  placeholder="919876543210"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 read-only:bg-ink/5 focus:border-bloom focus:outline-none focus:ring-2 focus:ring-bloom/20"
                />
              </label>

              {canManage && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={paymentSaving}
                    className="rounded-full bg-plum px-6 py-3 font-semibold text-cream shadow-soft transition hover:bg-ink disabled:opacity-60"
                  >
                    {paymentSaving ? 'Saving…' : 'Save payment settings'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
