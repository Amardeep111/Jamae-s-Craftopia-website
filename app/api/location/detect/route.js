import { NextResponse } from 'next/server'
import { INDIAN_STATES } from '@/lib/address/india'

const STATE_CODE_MAP = new Map(INDIAN_STATES.map((s) => [s.value.toUpperCase(), s.label]))

export async function GET(request) {
  try {
    // 1. Check for Vercel GeoIP headers (instant, 0ms, zero external calls)
    const latStr = request.headers.get('x-vercel-ip-latitude')
    const lngStr = request.headers.get('x-vercel-ip-longitude')
    const city = request.headers.get('x-vercel-ip-city')
    const region = request.headers.get('x-vercel-ip-country-region')
    const country = request.headers.get('x-vercel-ip-country') || 'India'
    const postalCode = request.headers.get('x-vercel-ip-postal-code')

    if (latStr && lngStr) {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      const stateName = (region && STATE_CODE_MAP.get(region.toUpperCase())) || region || ''

      return NextResponse.json({
        success: true,
        source: 'vercel-ip',
        data: {
          lat,
          lng,
          city: city ? decodeURIComponent(city) : '',
          state: stateName,
          country,
          pinCode: postalCode || '',
        },
      })
    }

    // 2. Fallback for local development or non-Vercel environments:
    // Query a fast public IP geolocation provider with a strict 2-second timeout
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : ''
    const isLocal = !clientIp || clientIp === '127.0.0.1' || clientIp === '::1'

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)

    try {
      const targetUrl = isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${clientIp}`
      const res = await fetch(targetUrl, { signal: controller.signal })
      clearTimeout(timer)
      const data = await res.json()

      if (data && data.success !== false && data.latitude && data.longitude) {
        return NextResponse.json({
          success: true,
          source: 'ipwhois',
          data: {
            lat: data.latitude,
            lng: data.longitude,
            city: data.city || '',
            state: data.region || '',
            country: data.country || 'India',
            pinCode: data.postal || '',
          },
        })
      }
    } catch {
      clearTimeout(timer)
    }

    // Default safe fallback (Siliguri, India — home base of Jamae's Craftopia)
    return NextResponse.json({
      success: true,
      source: 'fallback-default',
      data: {
        lat: 26.7271,
        lng: 88.3953,
        city: 'Siliguri',
        state: 'West Bengal',
        country: 'India',
        pinCode: '734001',
      },
    })
  } catch (error) {
    console.error('IP location detection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Could not detect IP location.',
    }, { status: 500 })
  }
}

