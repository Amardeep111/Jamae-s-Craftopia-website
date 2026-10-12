import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'

// POST - Upload image
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const productId = formData.get('productId')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate filename with timestamp
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = productId
      ? `products/${productId}/${timestamp}.${extension}`
      : `uploads/${timestamp}.${extension}`

    // Upload to Vercel Blob (or return mock URL in development)
    let url, pathname

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      })
      url = blob.url
      pathname = blob.pathname
    } else {
      // Development: simulate upload with local path
      url = `/uploads/${filename}`
      pathname = filename
      console.log('Development mode: Image upload simulated', { url, pathname })
    }

    return NextResponse.json({
      success: true,
      url,
      pathname,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// DELETE - Delete image
export async function DELETE(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No URL provided' },
        { status: 400 }
      )
    }

    // Delete from Vercel Blob (or skip in development)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(url)
    } else {
      console.log('Development mode: Image deletion simulated', { url })
    }

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
