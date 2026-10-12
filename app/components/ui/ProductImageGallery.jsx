'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import ProductImage from './ProductImage'

/**
 * Product image gallery — 3 images per product.
 *
 * Uses product.visual + product.palette to render 3 distinct illustration
 * views (front, side, close-up) when real photos are not available,
 * ensuring every product has 3 visible demo images.
 */
export default function ProductImageGallery({ product }) {
  const visual = product?.visual || 'yarn'
  const palette = product?.palette
  const name = product?.name || 'Product image'

  const views = [1, 2, 3]
  const [active, setActive] = useState(0)

  const atFirst = active === 0
  const atLast = active === views.length - 1

  const goPrev = () => setActive((i) => Math.max(0, i - 1))
  const goNext = () => setActive((i) => Math.min(views.length - 1, i + 1))

  return (
    <div>
      {/* Main image — fixed container, image adapts inside */}
      <div className="paper-card aspect-square overflow-hidden relative bg-gradient-to-br from-ivory/60 to-sand/30">
        <div className="h-full w-full flex items-center justify-center p-4">
          {views.map((v, i) => (
            <div
              key={v}
              className={cn(
                'absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300',
                active === i ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              <ProductImage
                visual={visual}
                palette={palette}
                view={v}
                alt={`${name} — view ${i + 1} of 3`}
                className="h-full w-full"
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={goPrev}
          disabled={atFirst}
          aria-label="Previous product image"
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-md ring-1 ring-sand/60 transition focus:outline-none focus:ring-2 focus:ring-bloom/40',
            atFirst
              ? 'bg-cream/50 text-muted/40 cursor-default'
              : 'bg-cream/90 text-plum hover:text-bloom hover:bg-cream active:scale-95'
          )}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={atLast}
          aria-label="Next product image"
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-md ring-1 ring-sand/60 transition focus:outline-none focus:ring-2 focus:ring-bloom/40',
            atLast
              ? 'bg-cream/50 text-muted/40 cursor-default'
              : 'bg-cream/90 text-plum hover:text-bloom hover:bg-cream active:scale-95'
          )}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Indicator dots */}
      <div
        className="mt-4 flex items-center justify-center gap-2.5"
        role="tablist"
        aria-label="Product image navigation"
      >
        {views.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`Show image ${i + 1} of 3`}
            onClick={() => setActive(i)}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-bloom/40',
              active === i ? 'w-7 bg-bloom' : 'w-2.5 bg-sand hover:bg-sand/70'
            )}
          />
        ))}
      </div>
    </div>
  )
}
