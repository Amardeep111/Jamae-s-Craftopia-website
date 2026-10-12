import { NextResponse } from 'next/server'
import { getReviewsForProduct } from '@/data/reviews'

export async function GET(request, { params }) {
  try {
    const { productId } = await params
    const reviews = getReviewsForProduct(productId)
    return NextResponse.json({ success: true, reviews, count: reviews.length })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 })
  }
}
