'use client'

import { useState } from 'react'
import CraftIllustration from './CraftIllustration'
import { cn } from '@/lib/cn'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/images'

export default function ProductImage({
  src,
  alt,
  visual = 'yarn',
  palette,
  view = 1,
  className,
  imgClassName,
  width,
  height,
  priority = false,
  fit = 'contain',
}) {
  const [error, setError] = useState(false)

  if (src && !error) {
    const imageSrc = src.startsWith('http')
      ? getOptimizedImageUrl(src, { width: 800, quality: 85 })
      : src
    return (
      <div className={cn('overflow-hidden relative', className)}>
        <Image
          src={imageSrc}
          alt={alt || ''}
          fill={!width && !height}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(fit === 'contain' ? 'object-contain' : 'object-cover', imgClassName)}
          onError={() => setError(true)}
        />
      </div>
    )
  }

  return (
    <CraftIllustration
      visual={visual}
      palette={palette}
      view={view}
      className={cn('h-full w-full', className)}
    />
  )
}
