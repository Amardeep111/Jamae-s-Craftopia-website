'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  MapPin, Compass, RotateCcw, ChevronDown, ChevronUp,
  User, Home, Building, Check, Navigation,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { ADDRESS_TYPES, validateAddress, blankAddress } from '@/lib/address'
import InteractiveLocationPicker from './InteractiveLocationPicker'

const PIN_MAP = {
  '400001': { city: 'Mumbai', state: 'Maharashtra' }, '400005': { city: 'Mumbai', state: 'Maharashtra' },
  '110001': { city: 'New Delhi', state: 'Delhi' }, '110010': { city: 'New Delhi', state: 'Delhi' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' }, '600020': { city: 'Chennai', state: 'Tamil Nadu' },
  '560001': { city: 'Bangalore', state: 'Karnataka' }, '560002': { city: 'Bangalore', state: 'Karnataka' },
  '500001': { city: 'Hyderabad', state: 'Telangana' }, '700001': { city: 'Kolkata', state: 'West Bengal' },
  '500081': { city: 'Secunderabad', state: 'Telangana' }, '260001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '410001': { city: 'Pune', state: 'Maharashtra' }, '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' }, '401301': { city: 'Pune', state: 'Maharashtra' },
  '311001': { city: 'Bhilai', state: 'Chhattisgarh' }, '700102': { city: 'Kolkata', state: 'West Bengal' },
  '700033': { city: 'Kolkata', state: 'West Bengal' },
}

export default function AddressForm({ open, onClose, onSave, initial = null }) {
  const [data, setData] = useState(initial ? { ...initial } : blankAddress())
  const [errors, setErrors] = useState({})
  const [openSections, setOpenSections] = useState({ info: true, address: true, location: true, prefs: true })
  const [addressMode, setAddressMode] = useState('method-selection') // 'method-selection' | 'manual' | 'location' | 'manual-after-location'
  const [confirmedLocationData, setConfirmedLocationData] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (initial) setData({ ...initial })
    else setData(blankAddress())
    setErrors({})
    setAddressMode('method-selection')
    setConfirmedLocationData(null)
  }, [initial, open])

  const toggle = (k) => setOpenSections((s) => ({ ...s, [k]: !s[k] }))
  const update = (k, v) => { setData((d) => ({ ...d, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: '' })) }

  const handlePinBlur = () => {
    const pin = (data.pinCode || '').replace(/\D/g, '').slice(0, 6)
    if (pin.length === 6 && PIN_MAP[pin]) { update('city', PIN_MAP[pin].city); update('state', PIN_MAP[pin].state); setErrors((e) => ({ ...e, pinCode: '' })) }
  }

  const handleLocationConfirm = (locData) => {
    const updates = {}
    if (locData.areaStreet || locData.street || locData.area) updates.areaStreet = locData.areaStreet || locData.street || locData.area || data.areaStreet || ''
    if (locData.city) updates.city = locData.city
    if (locData.state) updates.state = locData.state
    if (locData.pinCode) updates.pinCode = locData.pinCode
    if (locData.country) updates.country = locData.country || ''
    if (locData.formattedAddress && !updates.areaStreet) updates.areaStreet = locData.formattedAddress
    if (locData.houseFlatBuilding) updates.houseFlatBuilding = locData.houseFlatBuilding
    if (locData.landmark) updates.landmark = locData.landmark
    // Coordinates for potential future use (optional, not required by form)
    if (locData.coordinates) {
      updates.lat = locData.coordinates.lat
      updates.lng = locData.coordinates.lng
    }
    setData((d) => ({ ...d, ...updates }))
    setConfirmedLocationData(locData)
    setAddressMode('manual-after-location')
    setErrors({})
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validateAddress(data)
    setErrors(errs)
    if (Object.keys(errs).length === 0) onSave({ ...data })
  }

  const SectionHead = ({ icon: Icon, title, k }) => (
    <button type="button" onClick={() => toggle(k)} className="w-full flex items-center gap-2 py-2 text-left focus:outline-none" aria-expanded={openSections[k]}>
      <Icon className="h-4 w-4 text-bloom" aria-hidden="true" />
      <span className="font-display text-base text-plum">{title}</span>
      <span className="ml-auto text-sand">{openSections[k] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
    </button>
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Address form" onClick={onClose}>
      <div ref={formRef} className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-cream shadow-lift p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="font-display text-2xl text-plum">{initial ? 'Edit address' : 'Add new address'}</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-ivory p-2 text-plum hover:bg-blush/30 transition" aria-label="Close address form"><RotateCcw className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <p className="text-xs text-muted mb-4">Use your current location or enter manually. All fields validated for Indian addresses.</p>

        {/* ====== METHOD SELECTION (only initially) ====== */}
        {addressMode === 'method-selection' && (
          <div className="rounded-3xl bg-ivory/60 ring-1 ring-sand p-5 mb-6">
            <h3 className="font-display text-xl text-plum flex items-center gap-2 mb-3"><Navigation className="h-5 w-5 text-bloom" aria-hidden="true" /> Select method</h3>
            <button
              type="button"
              onClick={() => setAddressMode('location')}
              className="w-full rounded-2xl bg-bloom text-cream px-5 py-4 text-left shadow-soft hover:bg-plum transition flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream/20 group-hover:bg-cream/30 transition"><Compass className="h-5 w-5" aria-hidden="true" /></div>
              <div>
                <p className="font-display text-lg">Use your current location</p>
                <p className="text-sm text-cream/90">Automatically find your address with a real interactive map.</p>
              </div>
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-sand" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted">OR</span>
              <div className="h-px flex-1 bg-sand" />
            </div>
            <button
              type="button"
              onClick={() => setAddressMode('manual')}
              className="w-full rounded-2xl bg-cream ring-1 ring-sand px-5 py-4 text-left hover:ring-blush/40 transition flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush/60 group-hover:bg-blush transition"><MapPin className="h-5 w-5 text-plum" aria-hidden="true" /></div>
              <div>
                <p className="font-display text-lg text-plum">Enter address manually</p>
                <p className="text-sm text-muted">Type your full delivery address yourself.</p>
              </div>
            </button>
          </div>
        )}

        {/* ====== LOCATION PICKER FLOW ====== */}
        {addressMode === 'location' && (
          <div className="rounded-3xl bg-ivory/60 ring-1 ring-sand p-5 mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display text-xl text-plum flex items-center gap-2"><Compass className="h-5 w-5 text-bloom" aria-hidden="true" /> Use current location</h3>
            </div>
            <button type="button" onClick={() => setAddressMode('method-selection')} className="mb-3 text-xs font-semibold text-bloom hover:text-plum underline underline-offset-2">← Change method</button>
            <InteractiveLocationPicker
              initialLat={data.lat || null}
              initialLng={data.lng || null}
              onConfirm={handleLocationConfirm}
              onCancel={() => setAddressMode('method-selection')}
              onBack={() => setAddressMode('method-selection')}
            />
          </div>
        )}

        {/* ====== UNIFIED MANUAL FORM (manual OR after location confirm) ====== */}
        {(addressMode === 'manual' || addressMode === 'manual-after-location') && (
          <div>
            <button type="button" onClick={() => { setAddressMode('method-selection'); setConfirmedLocationData(null); }} className="mb-4 text-xs font-semibold text-bloom hover:text-plum underline underline-offset-2">← Change method</button>
            {confirmedLocationData && (
              <div className="rounded-2xl bg-sage/10 ring-1 ring-sage/30 p-4 mb-4">
                <p className="text-sm text-sage font-semibold">Location detected from GPS · <span className="text-xs font-normal text-muted">{confirmedLocationData.city || ''}, {confirmedLocationData.state || ''}</span></p>
              </div>
            )}
          </div>
        )}

        {/* ====== MANUAL FORM (visible when manual or manual-after-location) ====== */}
        {(addressMode === 'manual' || addressMode === 'manual-after-location') && (
          <form onSubmit={submit} className="space-y-4" noValidate>
          {/* Contact Info */}
          <section className="paper-card p-5 bg-ivory/40" aria-label="Contact information">
            <SectionHead icon={User} title="Contact information" k="info" />
            {openSections.info && (
              <div className="grid gap-4 sm:grid-cols-2 pt-3">
                <Input label="Full name" value={data.fullName} onChange={(e) => update('fullName', e.target.value)} error={errors.fullName} placeholder="Aisha Mehta" autoComplete="name" />
                <Input label="Mobile number" value={data.mobileNumber} onChange={(e) => update('mobileNumber', e.target.value)} error={errors.mobileNumber} placeholder="9876543210" autoComplete="tel-national" type="tel" />
              </div>
            )}
          </section>

          {/* Address Lines */}
          <section className="paper-card p-5 bg-ivory/40" aria-label="Address details">
            <SectionHead icon={Home} title="Address details" k="address" />
            {openSections.address && (
              <div className="space-y-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="House / Flat / Building *" value={data.houseFlatBuilding} onChange={(e) => update('houseFlatBuilding', e.target.value)} error={errors.houseFlatBuilding} placeholder="Flat 4B, Shalom Apartments" autoComplete="address-line1" />
                  <Input label="Area / Street *" value={data.areaStreet} onChange={(e) => update('areaStreet', e.target.value)} error={errors.areaStreet} placeholder="Andheri West, Linking Road" autoComplete="address-line2" />
                </div>
                <Input label="Landmark (Optional)" value={data.landmark || ''} onChange={(e) => update('landmark', e.target.value)} placeholder="Near Juhu Beach, opposite ICICI Bank" autoComplete="address-line3" />
              </div>
            )}
          </section>

          {/* Location */}
          <section className="paper-card p-5 bg-ivory/40" aria-label="Location">
            <SectionHead icon={MapPin} title="Location" k="location" />
            {openSections.location && (
              <div className="pt-3 space-y-4">
                <div>
                  <label htmlFor="pin-code" className="block text-sm font-medium text-plum mb-1">PIN code *</label>
                  <div className="flex gap-2">
                    <input id="pin-code" type="text" inputMode="numeric" maxLength={6} value={data.pinCode} onChange={(e) => update('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))} onBlur={handlePinBlur} className={cn('w-32 rounded-2xl border bg-cream px-4 py-3 text-sm outline-none transition focus:ring-2', errors.pinCode ? 'border-bloom focus:ring-bloom/30' : 'border-sand focus:ring-bloom/30')} placeholder="400001" autoComplete="postal-code" />
                  </div>
                  {errors.pinCode && <p className="mt-1.5 text-sm text-bloom">{errors.pinCode}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="City *" value={data.city} onChange={(e) => update('city', e.target.value)} error={errors.city} placeholder="Mumbai" autoComplete="address-level2" />
                  <Input label="State *" value={data.state} onChange={(e) => update('state', e.target.value)} error={errors.state} placeholder="Maharashtra" autoComplete="address-level1" />
                </div>
              </div>
            )}
          </section>

          {/* Preferences */}
          <section className="paper-card p-5 bg-ivory/40" aria-label="Address preferences">
            <SectionHead icon={Building} title="Preferences" k="prefs" />
            {openSections.prefs && (
              <div className="pt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-type" className="block text-sm font-medium text-plum mb-1">Address type</label>
                  <Select
                    id="addr-type"
                    value={data.addressType}
                    onChange={(v) => update('addressType', v)}
                    options={ADDRESS_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                    placeholder="Select address type"
                    className="!w-full !bg-cream !rounded-2xl"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-sand bg-cream px-4 py-3 cursor-pointer transition hover:border-bloom/30"><input type="checkbox" checked={!!data.isDefault} onChange={(e) => update('isDefault', e.target.checked)} className="h-5 w-5 rounded border-sand text-bloom focus:ring-2 focus:ring-bloom/30" /><span className="text-sm font-medium text-plum">Set as default address</span></label>
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted hover:text-plum transition ring-1 ring-sand hover:ring-blush/40">Cancel</button>
            <button type="submit" className="rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-cream shadow-soft hover:bg-ink transition active:translate-y-0">{initial ? 'Update address' : 'Save address'}</button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
