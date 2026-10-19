import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'

const ratingIsValid = (value) => Number.isInteger(value) && value >= 1 && value <= 5

export async function GET(request, { params }) {
  try {
    const { productId } = await params
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    const [rows, deliveredOrder] = await Promise.all([
      prisma.review.findMany({ where: { productId }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
      session?.user ? prisma.order.findFirst({ where: { userId: session.user.id, status: 'DELIVERED', items: { some: { productId } } }, select: { id: true } }) : null,
    ])
    const reviews = rows.map((review) => ({
      id: review.id,
      name: review.user.name || 'Verified customer',
      verifiedPurchase: true,
      rating: (review.productRating + review.deliveryRating + review.packagingRating) / 3,
      productRating: review.productRating,
      deliveryRating: review.deliveryRating,
      packagingRating: review.packagingRating,
      title: review.title,
      text: review.comment,
      photos: review.images,
      date: review.createdAt.toISOString(),
      helpful: 0,
    }))
    const alreadyReviewed = session?.user ? rows.some((review) => review.userId === session.user.id) : false
    return NextResponse.json({ success: true, reviews, count: reviews.length, authenticated: Boolean(session?.user), canReview: Boolean(deliveredOrder && !alreadyReviewed) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Review list failed:', error)
    return NextResponse.json({ success: false, error: 'Reviews are temporarily unavailable.' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { productId } = await params
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user) return NextResponse.json({ success: false, error: 'Sign in to write a review.' }, { status: 401 })
    const body = await request.json()
    if (!ratingIsValid(body.productRating) || !ratingIsValid(body.deliveryRating) || !ratingIsValid(body.packagingRating)) return NextResponse.json({ success: false, error: 'Rate the product, delivery, and packaging from 1 to 5 stars.' }, { status: 400 })
    const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const images = Array.isArray(body.images) ? body.images : []
    if (comment.length < 5 || comment.length > 2000) return NextResponse.json({ success: false, error: 'Your review must be between 5 and 2,000 characters.' }, { status: 400 })
    if (title.length > 120) return NextResponse.json({ success: false, error: 'Review title must be 120 characters or fewer.' }, { status: 400 })
    if (images.length > 5 || images.some((url) => {
      if (typeof url !== 'string' || url.length > 2000) return true
      if (url.startsWith('/uploads/reviews/')) return false
      try { const parsed = new URL(url); return parsed.protocol !== 'https:' || !(parsed.hostname === 'res.cloudinary.com' || parsed.hostname.endsWith('.res.cloudinary.com')) } catch { return true }
    })) return NextResponse.json({ success: false, error: 'Choose up to 5 valid review photos.' }, { status: 400 })
    const order = await prisma.order.findFirst({ where: { userId: session.user.id, status: 'DELIVERED', items: { some: { productId } } }, select: { id: true } })
    if (!order) return NextResponse.json({ success: false, error: 'You can review this item after its delivery is complete.' }, { status: 403 })
    const review = await prisma.review.create({ data: { productId, userId: session.user.id, orderId: order.id, productRating: body.productRating, deliveryRating: body.deliveryRating, packagingRating: body.packagingRating, title: title || null, comment, images } })
    return NextResponse.json({ success: true, data: review, message: 'Thanks — your verified purchase review is posted.' }, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ success: false, error: 'You have already reviewed this product.' }, { status: 409 })
    console.error('Review submission failed:', error)
    return NextResponse.json({ success: false, error: 'Your review could not be saved right now.' }, { status: 500 })
  }
}
