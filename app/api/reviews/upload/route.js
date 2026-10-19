import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'
import { uploadImageToStorage } from '@/lib/cloudinary'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user) return NextResponse.json({ success: false, error: 'Sign in before adding review photos.' }, { status: 401 })
    const form = await request.formData()
    const productId = String(form.get('productId') || '')
    const files = form.getAll('files')
    if (!productId || files.length < 1 || files.length > 5) return NextResponse.json({ success: false, error: 'Choose up to 5 photos for this product review.' }, { status: 400 })
    if (files.some((file) => !file || typeof file.size !== 'number') || files.reduce((sum, file) => sum + file.size, 0) > 4 * 1024 * 1024) return NextResponse.json({ success: false, error: 'Review photos must be 4 MB total or smaller. Choose fewer or smaller images.' }, { status: 400 })
    const delivered = await prisma.order.findFirst({ where: { userId: session.user.id, status: 'DELIVERED', items: { some: { productId } } }, select: { id: true } })
    if (!delivered) return NextResponse.json({ success: false, error: 'Review photos are available after your order is delivered.' }, { status: 403 })
    const uploaded = await Promise.all(files.map((file) => uploadImageToStorage(file, `jamaes-craftopia/reviews/${productId}`)))
    return NextResponse.json({ success: true, images: uploaded.map((image) => image.url) }, { status: 201 })
  } catch (error) {
    const message = error.message || 'Review photos could not be uploaded.'
    const status = /not configured/i.test(message) ? 503 : /choose|4 MB|JPEG|PNG|WebP/i.test(message) ? 400 : 500
    console.error('Review image upload failed:', error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
