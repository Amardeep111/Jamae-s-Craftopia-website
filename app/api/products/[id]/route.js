import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const product = await db.getProductById(id) || await db.getProductBySlug(id)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
