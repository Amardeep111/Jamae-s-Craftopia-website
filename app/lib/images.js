/**
 * Image Upload and Management Utilities
 * Handles Cloudinary-backed product image delivery and upload requests.
 */

/**
 * Upload a product image to storage
 * @param {File} file - The image file to upload
 * @param {string} productId - The product ID for organizing images
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadProductImage(file, productId) {
  if (!file) throw new Error('No file provided')

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('productId', productId)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload image')
  }

  return response.json()
}

/**
 * Delete an image from storage
 * @param {string} url - The image URL to delete
 * @returns {Promise<void>}
 */
export async function deleteProductImage(url) {
  const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete image')
  }
}

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
const urlCache = new Map()

export function getOptimizedImageUrl(url, options = {}) {
  const key = url + '|' + JSON.stringify(options)
  if (urlCache.has(key)) return urlCache.get(key)

  if (!url) { urlCache.set(key, null); return null }

  // For local development or mock images, return as-is
  if (url.startsWith('/') || url.includes('localhost')) {
    return url
  }

  const { width, height, quality = 85, format = 'webp' } = options
  if (url.includes('res.cloudinary.com/') && url.includes('/image/upload/')) {
    const transforms = [`f_${format === 'webp' ? 'auto' : format}`, `q_${quality}`, width ? `w_${width}` : null, height ? `h_${height}` : null, 'c_limit'].filter(Boolean).join(',')
    const result = url.replace('/image/upload/', `/image/upload/${transforms}/`)
    urlCache.set(key, result)
    return result
  }

  // Other remote image URLs remain usable as-is.
  if (!url.startsWith('/')) { urlCache.set(key, url); return url }

  // Local development image paths are served by Next.js.
  urlCache.set(key, url)
  return url
}

/**
 * Generate srcset for responsive images
 * @param {string} url - Original image URL
 * @param {number[]} widths - Array of widths for srcset
 * @returns {string} srcset string
 */
export function generateSrcSet(url, widths = [640, 750, 828, 1080, 1200]) {
  if (!url) return ''

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(url, { width, format: 'webp' })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Validate image dimensions
 * @param {File} file - Image file
 * @param {Object} requirements - Min/max dimensions
 * @returns {Promise<boolean>}
 */
export function validateImageDimensions(file, requirements = {}) {
  const { minWidth = 400, minHeight = 400, maxWidth = 4000, maxHeight = 4000 } = requirements

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      if (img.width < minWidth || img.height < minHeight) {
        reject(new Error(`Image too small. Minimum dimensions: ${minWidth}x${minHeight}px`))
      } else if (img.width > maxWidth || img.height > maxHeight) {
        reject(new Error(`Image too large. Maximum dimensions: ${maxWidth}x${maxHeight}px`))
      } else {
        resolve(true)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}
