import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const product = await db.getProductById(id) || await db.getProductBySlug(id)

    if (!product || product.published === false) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { ...product, category: product.categoryId || product.category, image: product.imageUrl || product.image || product.images?.[0] || null },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
