/**
 * Free geolocation picker (no Mapbox token needed).
 */
'use client'

import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

export default function CurrentLocationPicker({ onSelect, disabled }) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleUseCurrent() {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported by this browser.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    function handleSuccess(position) {
      setLoading(false)
      onSelect?.({ lat: position.coords.latitude, lng: position.coords.longitude, source: 'geolocation' })
    }

    function handleError(err) {
      setLoading(false)
      setErrorMsg(
        err.code === 1
          ? 'Location permission denied. Please enter manually.'
          : err.code === 3
          ? 'Location detection timed out. Please enter manually or try again.'
          : 'Could not read location. Please enter manually.'
      )
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        if (err.code === 3 || err.code === 2) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          )
        } else {
          handleError(err)
        }
      },
      { enableHighAccuracy: true, timeout: 5500, maximumAge: 0 }
    )
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleUseCurrent} disabled={disabled || loading} className="inline-flex items-center gap-2 rounded-full bg-plum/10 border-2 border-plum/20 text-plum px-4 py-2 text-sm font-semibold hover:bg-plum hover:text-cream transition">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        Use my current location
      </button>
      {errorMsg && <p className="text-xs text-bloom">{errorMsg}</p>}
    </div>
  )
}
