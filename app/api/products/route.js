import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : undefined
    const skip = searchParams.get('skip')
      ? parseInt(searchParams.get('skip'))
      : (page && page > 1 && limit ? (page - 1) * limit : undefined)

    const filters = {}
    if (category && category !== 'all') filters.categoryId = category
    if (featured === 'true') filters.featured = true
    if (search) filters.search = search
    if (limit) filters.limit = limit
    if (skip) filters.skip = skip
    // Public catalog requests can never expose draft/unpublished listings.
    filters.published = true

    const [products, totalCount] = await Promise.all([
      db.getProducts(filters),
      typeof db.countProducts === 'function' ? db.countProducts(filters) : Promise.resolve(null),
    ])

    const publicProducts = products.map((product) => {
      const categorySlug = product.category?.slug || product.categorySlug || product.categoryId || null
      return {
        ...product,
        category: categorySlug,
        categoryId: product.categoryId,
        categoryName: product.category?.name || null,
        image: product.imageUrl || product.image || product.images?.[0] || null,
      }
    })

    const hasMore = limit
      ? (typeof totalCount === 'number' ? (skip || 0) + publicProducts.length < totalCount : publicProducts.length === limit)
      : false

    return NextResponse.json({
      success: true,
      data: publicProducts,
      count: publicProducts.length,
      total: totalCount ?? publicProducts.length,
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
