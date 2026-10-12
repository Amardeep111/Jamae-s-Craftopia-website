import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')

    const filters = {}
    if (category && category !== 'all') filters.categoryId = category
    if (featured === 'true') filters.featured = true
    if (search) filters.search = search
    if (limit) filters.limit = parseInt(limit)

    const products = await db.getProducts(filters)

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // This would be protected by admin authentication
    const body = await request.json()

    return NextResponse.json(
      { success: false, error: 'Not implemented - requires admin authentication' },
      { status: 501 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
