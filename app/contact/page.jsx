'use client'

import { useState } from 'react'
import { CheckCircle2, MapPin, MessageCircle } from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import { site } from '@/data/site'

const initial = { name: '', email: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Please add your name.'
    if (!form.email.trim()) next.email = 'We need an email to write back.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'That email does not look quite right.'
    if (!form.message.trim()) next.message = 'A few words are enough.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitted(true)
  }

  return (
    <>
        <PageHeader
          eyebrow="A note from you"
          title="Come say hello."
          description="Questions, custom ideas, or a simple hello — we would love to hear from you. Jamae's Craftopia is based in Siliguri, and always glad to talk yarn."
        />

        <div className="container-page grid gap-10 pb-20 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="paper-card px-8 py-14 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-moss" />
                <h2 className="heading-display mt-4 text-3xl">Message received</h2>
                <p className="mt-3 text-muted">
                  Thank you, {form.name}. This form is frontend-only for now — connect it to email or WhatsApp when you
                  are ready to receive notes for real.
                </p>
                <Button className="mt-6" onClick={() => { setSubmitted(false); setForm(initial) }}>
                  Write another note
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="paper-card p-6 sm:p-10" noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-plum">Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    autoComplete="name"
                    className={field(errors.name)}
                  />
                  {errors.name ? <span className="mt-1 block text-sm text-bloom">{errors.name}</span> : null}
                </label>
                <label className="mt-5 block">
                  <span className="mb-1.5 block text-sm font-semibold text-plum">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    autoComplete="email"
                    className={field(errors.email)}
                  />
                  {errors.email ? <span className="mt-1 block text-sm text-bloom">{errors.email}</span> : null}
                </label>
                <label className="mt-5 block">
                  <span className="mb-1.5 block text-sm font-semibold text-plum">Message</span>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    className={field(errors.message)}
                  />
                  {errors.message ? <span className="mt-1 block text-sm text-bloom">{errors.message}</span> : null}
                </label>
                <Button type="submit" className="mt-6">
                  Send message
                </Button>
              </form>
            )}
          </div>

          <aside className="space-y-4 lg:col-span-2">
            <div className="paper-card p-6">
              <MapPin className="h-5 w-5 text-bloom" />
              <h2 className="mt-3 font-display text-2xl text-plum">Visit in spirit</h2>
              <p className="mt-2 text-muted">{site.location}</p>
              <p className="mt-2 text-sm text-muted">{site.email}</p>
              <p className="text-sm text-muted">{site.phone}</p>
            </div>
            <a href={site.social.instagram} className="paper-card flex items-center gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-plum">
                <InstagramIcon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-display text-xl text-plum">Instagram</span>
                <span className="text-sm text-muted">Follow the craft table</span>
              </span>
            </a>
            <a href={site.social.facebook} className="paper-card flex items-center gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender/70 text-plum">
                <FacebookIcon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-display text-xl text-plum">Facebook</span>
                <span className="text-sm text-muted">Say hello there too</span>
              </span>
            </a>
            <a href={site.whatsapp} className="paper-card flex items-center gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/70 text-plum">
                <MessageCircle />
              </span>
              <span>
                <span className="block font-display text-xl text-plum">WhatsApp</span>
                <span className="text-sm text-muted">A quick, personal chat</span>
              </span>
            </a>
          </aside>
        </div>
      </>
  )
}

function field(error) {
  return `w-full rounded-2xl border bg-cream px-4 py-3 outline-none focus:ring-2 focus:ring-bloom/30 ${
    error ? 'border-bloom' : 'border-sand'
  }`
}