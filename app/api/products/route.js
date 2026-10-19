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
    // Public catalog requests can never expose draft/unpublished listings.
    filters.published = true

    const products = await db.getProducts(filters)
    const publicProducts = products.map((product) => ({ ...product, category: product.categoryId || product.category, image: product.imageUrl || product.image || product.images?.[0] || null }))

    return NextResponse.json({
      success: true,
      data: publicProducts,
      count: publicProducts.length,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
