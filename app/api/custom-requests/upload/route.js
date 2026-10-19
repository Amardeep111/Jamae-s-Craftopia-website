import { NextResponse } from 'next/server'
import { uploadImageToStorage } from '@/lib/cloudinary'
import { enforceAuthRateLimit } from '@/lib/auth/rate-limit'
import { verifySession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    // Allow multipart headers and boundaries in addition to the 4 MB image cap.
    if (contentLength > 4.25 * 1024 * 1024) return NextResponse.json({ success: false, error: 'Each image must be 4 MB or smaller.' }, { status: 413 })
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user || session.user.role !== 'CUSTOMER') return NextResponse.json({ success: false, error: 'Sign in to upload custom request photos.' }, { status: 401 })
    const limit = await enforceAuthRateLimit(request, { scope: 'custom-request-image', identity: session.user.id, ipLimit: 30, identityLimit: 12, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 })
    if (limit.limited) return NextResponse.json({ success: false, error: 'Too many image uploads. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') return NextResponse.json({ success: false, error: 'Choose an image to upload.' }, { status: 400 })
    if (file.size === 0) return NextResponse.json({ success: false, error: 'The selected image is empty. Choose another image.' }, { status: 400 })
    const result = await uploadImageToStorage(file, 'jamaes-craftopia/custom-requests')
    return NextResponse.json({ success: true, url: result.url }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Custom request image upload failed:', error)
    const message = error.message || 'Could not upload this image.'
    const status = /not configured/i.test(message) ? 503 : /choose|4 MB|JPEG|PNG|WebP/i.test(message) ? 400 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
