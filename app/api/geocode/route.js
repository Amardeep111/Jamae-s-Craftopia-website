/**
 * Server-side reverse geocoding route.
 *
 * Uses the Mapbox Geocoding API server-to-server with the secret MAPBOX_ACCESS_TOKEN.
 * The API token is NEVER exposed to the browser.
 *
 * The client-side map renders using NEXT_PUBLIC_MAPBOX_TOKEN (public, read-only tile access).
 * Reverse geocoding — which is rate-limited and more sensitive — goes through this
 * server route so the secret token is never in the client bundle.
 */

export async function POST(request) {
  try {
    const body = await request.json()
    const { lat, lng } = body || {}

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const token = process.env.MAPBOX_ACCESS_TOKEN

    // If no token, try Nominatim as development fallback (no key needed)
    if (!token || token.trim() === '') {
      return await nominatimReverseGeocode(latNum, lngNum)
    }

    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(lngNum)},${encodeURIComponent(latNum)}` +
      `?access_token=${encodeURIComponent(token)}` +
      `&types=address,place,locality,neighborhood,poi` +
      `&language=en` +
      `&country=in` +
      `&limit=3`

    const res = await fetch(url, { next: { revalidate: 300 } })

    if (!res.ok) {
      const text = await res.text()
      // eslint-disable-next-line no-console
      console.error('[Geocode] Mapbox API error', res.status, text)
      return new Response(
        JSON.stringify({ error: 'Geocoding service temporarily unavailable.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    const features = data.features || []

    if (features.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No address found for this location. Please adjust the pin or enter manually.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Primary result (most specific)
    const primary = features[0]
    const context = primary.context || []

    const getContext = (types) => {
      for (const item of context) {
        if (item.id && types.some((t) => item.id.startsWith(t))) {
          return item.text || item.description || ''
        }
      }
      return ''
    }

    const extract = (field) => primary.properties?.[field] || primary[`${field}_en`] || primary[field] || ''

    // Build street/road from address line
    const addressLine = primary.address || ''
    const streetName = extract('name') || extract('address') || ''
    const street = [addressLine, streetName].filter(Boolean).join(', ')

    const city =
      extract('place') ||
      getContext('place.') ||
      getContext('locality.') ||
      ''

    const state =
      extract('region') ||
      getContext('region.') ||
      ''

    const pinCode =
      extract('postcode') ||
      getContext('postcode.') ||
      ''

    const country =
      extract('country') ||
      'India'

    const addressData = {
      street: street || '',
      areaStreet: street || '',
      area: extract('neighborhood') || extract('locality') || getContext('neighborhood.') || getContext('locality.') || street || '',
      city,
      state,
      country,
      pinCode,
      formattedAddress: primary.place_name || '',
      coordinates: { lat: latNum, lng: lngNum },
      provider: 'mapbox',
    }

    return new Response(JSON.stringify({ success: true, address: addressData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Geocode] route error', e)
    return new Response(
      JSON.stringify({ error: e.message || 'Geocoding request failed.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Development fallback to OpenStreetMap Nominatim (free, no key).
 * Used when MAPBOX_ACCESS_TOKEN is not configured.
 */
async function nominatimReverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}&accept-language=en&addressdetails=1`

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'JamaesCraftopia/1.0 (contact@jamaescraftopia.com)' },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: 'Geocoding service unavailable. Please enter your address manually.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const data = await res.json()
  const addr = data.address || {}

  const addressData = {
    street: [addr.road, addr.house_number].filter(Boolean).join(', '),
    areaStreet: [addr.road, addr.house_number].filter(Boolean).join(', '),
    area: [addr.suburb, addr.neighbourhood, addr.quarter, addr.village]
      .filter(Boolean)
      .join(', '),
    city:
      addr.city || addr.town || addr.municipality || addr.village || '',
    state: addr.state || '',
    country: addr.country || 'India',
    pinCode: addr.postcode || '',
    formattedAddress: data.display_name || '',
    coordinates: { lat, lng },
    provider: 'nominatim',
  }

  return new Response(
    JSON.stringify({ success: true, address: addressData }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
