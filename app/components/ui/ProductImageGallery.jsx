'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/images'
import ProductImage from './ProductImage'

export default function ProductImageGallery({ product }) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const photos = useMemo(() => [...new Set([
    product?.imageUrl,
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter((url) => typeof url === 'string' && url.trim()))], [product?.imageUrl, product?.image, product?.images])
  const visual = product?.visual || 'yarn'
  const name = product?.name || 'Product image'
  const imageCount = photos.length || 3

  function changeImage(delta) {
    setSelected((index) => (index + delta + imageCount) % imageCount)
  }

  useEffect(() => {
    if (!viewerOpen) return
    function handleKeyDown(event) {
      if (event.key === 'Escape') setViewerOpen(false)
      if (event.key === 'ArrowLeft') changeImage(-1)
      if (event.key === 'ArrowRight') changeImage(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewerOpen, imageCount])

  const optimized = (url, width = 1400, quality = 85) => getOptimizedImageUrl(url, { width, quality })

  return <>
    <div className="space-y-3">
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ivory sm:aspect-square lg:aspect-[4/5]">
        {photos.length ? <button type="button" onClick={() => setViewerOpen(true)} aria-label={`Open full-size ${name} photo ${selected + 1}`} className="absolute inset-0 flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-bloom">
          <img src={optimized(photos[selected])} alt={`${name}, photo ${selected + 1} of ${photos.length}`} className="h-full w-full object-cover" />
        </button> : <button type="button" onClick={() => setViewerOpen(true)} aria-label={`Open ${name} illustration`} className="absolute inset-0"><ProductImage visual={visual} palette={product?.palette} view={selected + 1} alt={`${name} illustration ${selected + 1}`} className="h-full w-full" /></button>}
        {(photos.length > 1 || !photos.length) && <>
          <button type="button" aria-label="Previous product image" onClick={() => changeImage(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-plum shadow-md transition hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Next product image" onClick={() => changeImage(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-plum shadow-md transition hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{selected + 1} / {imageCount}</span>
        </>}
      </div>
      {photos.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
        {photos.map((url, index) => <button key={url} type="button" onClick={() => setSelected(index)} aria-label={`Show ${name} photo ${index + 1}`} aria-current={selected === index} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-ivory ${selected === index ? 'border-plum' : 'border-transparent opacity-75 hover:opacity-100'}`}><img src={optimized(url, 160, 75)} alt="" className="h-full w-full object-cover" /></button>)}
      </div>}
    </div>

    {viewerOpen && <div className="fixed inset-0 z-[70] flex h-[100dvh] flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label={`${name} photo viewer`} onClick={() => setViewerOpen(false)}>
      <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-sm">{name} · {selected + 1} / {imageCount}</span>
        <button type="button" aria-label="Close image viewer" onClick={() => setViewerOpen(false)} className="rounded-full bg-white/15 p-2 hover:bg-white/25"><X className="h-5 w-5" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-2 sm:px-20" onTouchStart={(event) => { event.currentTarget.dataset.touchX = String(event.touches[0].clientX) }} onTouchEnd={(event) => {
        const start = Number(event.currentTarget.dataset.touchX)
        const distance = event.changedTouches[0].clientX - start
        if (Math.abs(distance) > 45) changeImage(distance > 0 ? -1 : 1)
      }}>
        <button type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); changeImage(-1) }} className="absolute left-2 z-10 rounded-full bg-white/15 p-3 hover:bg-white/25 sm:left-5"><ChevronLeft className="h-6 w-6" /></button>
        {photos.length ? <img src={optimized(photos[selected], 2000, 90)} alt={`${name}, photo ${selected + 1} of ${photos.length}`} onClick={(event) => event.stopPropagation()} className="h-full w-full object-contain" /> : <div onClick={(event) => event.stopPropagation()} className="h-full w-full"><ProductImage visual={visual} palette={product?.palette} view={selected + 1} alt={`${name}, illustration ${selected + 1}`} className="h-full w-full" /></div>}
        <button type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); changeImage(1) }} className="absolute right-2 z-10 rounded-full bg-white/15 p-3 hover:bg-white/25 sm:right-5"><ChevronRight className="h-6 w-6" /></button>
      </div>
      {photos.length > 1 && <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-3" onClick={(event) => event.stopPropagation()}>
        {photos.map((url, index) => <button key={url} type="button" aria-label={`Show photo ${index + 1}`} aria-current={selected === index} onClick={() => setSelected(index)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 ${selected === index ? 'border-white' : 'border-white/30 opacity-65 hover:opacity-100'}`}><img src={optimized(url, 120, 70)} alt="" className="h-full w-full object-cover" /></button>)}
      </div>}
    </div>}
  </>
}
