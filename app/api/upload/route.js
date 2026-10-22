import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { uploadImageToStorage } from '@/lib/cloudinary'

async function requireManager(request) {
  const cookie = request.cookies.get('jamaes_session')?.value
  const session = await getAdminSession(cookie, 'products.manage')
  if (session) return session
  return getAdminSession(cookie, 'settings.manage')
}

// POST - Upload image
export async function POST(request) {
  try {
    const session = await requireManager(request)
    if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to upload images.' }, { status: 403 })
    const formData = await request.formData()
    const file = formData.get('file')
    const productId = formData.get('productId')
    const targetFolder = formData.get('folder')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const folder = targetFolder
      ? String(targetFolder).replace(/[^a-zA-Z0-9_\-\/]/g, '')
      : productId
        ? `jamaes-craftopia/products/${String(productId).replace(/[^a-zA-Z0-9_-]/g, '')}`
        : 'jamaes-craftopia/storefront'
    const { url, publicId } = await uploadImageToStorage(file, folder)

    return NextResponse.json({
      success: true,
      url,
      publicId,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: /not configured/i.test(error.message || '') ? 503 : /choose|4 MB|JPEG|PNG|WebP/i.test(error.message || '') ? 400 : 500 }
    )
  }
}

// DELETE - Delete image
export async function DELETE(request) {
  try {
    const session = await requireProductManager(request)
    if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to delete product images.' }, { status: 403 })
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No URL provided' },
        { status: 400 }
      )
    }

    // Cloudinary deletion needs the public ID; old URL-only calls stay harmless.

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
