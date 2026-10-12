'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { shopCategories } from '@/data/categories'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import CraftIllustration from '@/components/ui/CraftIllustration'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Select from '@/components/ui/Select'

const initial = {
  name: '',
  contact: '',
  idea: '',
  category: '',
  colors: '',
  budget: '',
  occasion: '',
  details: '',
}

const budgets = ['Under ₹500', '₹500 – ₹1,500', '₹1,500 – ₹3,000', '₹3,000+', "Let's decide together"]

export default function CustomOrders() {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please share your name.'
    if (!form.contact.trim()) next.contact = 'Email or phone helps us reply.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact) && !/^[+\d][\d\s-]{7,}$/.test(form.contact)) {
      next.contact = 'Enter a valid email or phone number.'
    }
    if (!form.idea.trim()) next.idea = 'A short idea is enough to begin.'
    if (!form.category) next.category = 'Pick the closest category.'
    if (!form.details.trim()) next.details = 'Tell us a little more — colour, size, or feeling.'
    return next
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="container-page py-20">
        <div className="paper-card mx-auto max-w-xl px-8 py-14 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-moss" aria-hidden="true" />
          <h1 className="heading-display mt-4 text-4xl">We received your idea</h1>
          <p className="mt-4 text-muted">
            Thank you, {form.name}. This form is ready for a future inbox — for now, your request is saved on this
            page so you can see how the experience will feel. Reach out on WhatsApp or the contact page if you would
            like to talk sooner.
          </p>
          <Button className="mt-8" onClick={() => { setSubmitted(false); setForm(initial) }}>
            Send another idea
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Made to order"
        title="Your idea, our yarn, a little bit of magic."
        description="Custom pieces are how Jamae's Craftopia began — a colour you love, a character from a story, a gift that could not come from a shelf."
      />

      <section className="container-page grid gap-8 pb-8 lg:grid-cols-3">
          {['Share a sketch or a feeling', 'We plan the stitches with you', 'A one-of-a-kind piece arrives'].map(
            (text, i) => (
              <ScrollReveal key={text} delay={i * 0.07}>
                <div className="paper-card p-6">
                  <p className="font-display text-3xl text-petal">0{i + 1}</p>
                  <p className="mt-2 font-display text-xl text-plum">{text}</p>
                </div>
              </ScrollReveal>
            ),
          )}
        </section>

        <section className="container-page grid gap-4 pb-12 sm:grid-cols-3">
          <div className="overflow-hidden rounded-3xl">
            <div className="aspect-[4/3]">
              <CraftIllustration visual="teddy" className="h-full" palette={['#E8C9A8', '#F3D5D0', '#4A342C']} />
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl">
            <div className="aspect-[4/3]">
              <CraftIllustration visual="bouquet" className="h-full" palette={['#F3C9B8', '#E8B4B8', '#F7EFE6']} />
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl">
            <div className="aspect-[4/3]">
              <CraftIllustration visual="gift" className="h-full" palette={['#D9CDE8', '#E8B4B8']} />
            </div>
          </div>
        </section>

        <section className="container-page pb-20">
          <form onSubmit={onSubmit} className="paper-card mx-auto max-w-2xl p-6 sm:p-10" noValidate>
            <h2 className="heading-display text-3xl">Tell us what to make</h2>
            <p className="mt-2 text-muted">Fields marked with a note are needed so we can reply kindly and clearly.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label="Name" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  autoComplete="name"
                  className={inputClass(errors.name)}
                />
              </Field>
              <Field label="Email or phone" error={errors.contact}>
                <input
                  value={form.contact}
                  onChange={(e) => setField('contact', e.target.value)}
                  autoComplete="email"
                  className={inputClass(errors.contact)}
                />
              </Field>
              <Field label="What would you like to create?" className="sm:col-span-2" error={errors.idea}>
                <input
                  value={form.idea}
                  onChange={(e) => setField('idea', e.target.value)}
                  placeholder="A peach bouquet, a bunny with a name tag…"
                  className={inputClass(errors.idea)}
                />
              </Field>
              <Field label="Category" error={errors.category}>
                <Select
                  value={form.category}
                  onChange={(v) => setField('category', v)}
                  options={[
                    { value: '', label: 'Choose one' },
                    ...shopCategories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  error={!!errors.category}
                />
              </Field>
              <Field label="Preferred colours">
                <input
                  value={form.colors}
                  onChange={(e) => setField('colors', e.target.value)}
                  placeholder="Blush, sage, cream…"
                  className={inputClass()}
                />
              </Field>
              <Field label="Budget range">
                <Select
                  value={form.budget}
                  onChange={(v) => setField('budget', v)}
                  options={[
                    { value: '', label: 'Optional' },
                    ...budgets.map((b) => ({ value: b, label: b })),
                  ]}
                />
              </Field>
              <Field label="Occasion">
                <input
                  value={form.occasion}
                  onChange={(e) => setField('occasion', e.target.value)}
                  placeholder="Birthday, wedding, just because"
                  className={inputClass()}
                />
              </Field>
              <Field label="Special request" className="sm:col-span-2" error={errors.details}>
                <textarea
                  value={form.details}
                  onChange={(e) => setField('details', e.target.value)}
                  rows={5}
                  className={inputClass(errors.details)}
                />
              </Field>
              <div className="sm:col-span-2">
                <label className="block rounded-2xl border border-dashed border-petal bg-blush/20 px-4 py-6 text-center text-sm text-muted">
                  <input type="file" accept="image/*" className="sr-only" disabled />
                  Reference image upload will be available when ordering is connected. For now, describe the image in
                  your request.
                </label>
              </div>
            </div>

            <Button type="submit" className="mt-8 w-full sm:w-auto">
              Send my custom request
        </Button>
      </form>
    </section>
    </>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-plum">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-bloom">{error}</span> : null}
    </label>
  )
}

function inputClass(error) {
  return `w-full rounded-2xl border bg-cream px-4 py-3 text-ink outline-none transition focus:ring-2 focus:ring-bloom/30 ${
    error ? 'border-bloom' : 'border-sand'
  }`
}