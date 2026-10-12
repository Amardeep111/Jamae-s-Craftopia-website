'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Star, ChevronLeft, ChevronRight, ThumbsUp,
  Camera, Check, X, Filter, SortDesc, Sparkles, ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { getReviewsForProduct, getAverageRating, getRatingDistribution } from '@/data/reviews'
import Button from './Button'
import Select from './Select'

function StarRating({ rating, max = 5, size = 'md', interactive = false, onSelect }) {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  const [hoverStar, setHoverStar] = useState(0)

  return (
    <div
      className={cn('flex items-center gap-0.5', interactive && 'cursor-pointer')}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Select star rating' : `Rating ${rating} out of ${max}`}
      onMouseLeave={() => interactive && setHoverStar(0)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const isFilled = interactive
          ? (hoverStar > 0 ? hoverStar >= starValue : rating >= starValue)
          : Math.round(rating) >= starValue
        return (
          <button
            key={i}
            type={interactive ? 'button' : 'span'}
            onClick={interactive ? () => onSelect(starValue) : undefined}
            onMouseEnter={interactive ? () => setHoverStar(starValue) : undefined}
            aria-label={interactive ? `Rate ${starValue} stars` : undefined}
            aria-selected={interactive ? starValue === rating : undefined}
            disabled={!interactive}
            className={cn(
              'transition-transform duration-150 focus:outline-none',
              interactive ? 'hover:scale-110 active:scale-95' : ''
            )}
          >
            <Star
              className={cn(
                sz,
                isFilled ? 'fill-bloom text-bloom' : 'fill-sand/30 text-sand/30',
                interactive ? 'hover:text-bloom' : ''
              )}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}

export default function CustomerReviews({ product }) {
  const reviews = useMemo(() => getReviewsForProduct(product?.id), [product?.id])
  const avg = getAverageRating(reviews)
  const counts = getRatingDistribution(reviews)
  const total = reviews.length

  const [expanded, setExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [filterStars, setFilterStars] = useState(0)
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 })
  const [helpful, setHelpful] = useState({})

  const [formName, setFormName] = useState('')
  const [formRating, setFormRating] = useState(0)
  const [formText, setFormText] = useState('')
  const [formPhotos, setFormPhotos] = useState([])
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  const openLightbox = useCallback((images, start = 0) => {
    setLightbox({ open: true, images, index: start })
  }, [])

  const closeLightbox = useCallback(() => setLightbox({ open: false, images: [], index: 0 }), [])
  const nextImg = useCallback(() => {
    setLightbox((s) => ({ ...s, index: (s.index + 1) % s.images.length }))
  }, [])
  const prevImg = useCallback(() => {
    setLightbox((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }))
  }, [])

  const handleHelpful = useCallback((id) => {
    setHelpful((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Sort + filter logic
  const sorted = useMemo(() => {
    let list = [...reviews]
    if (filterStars > 0) list = list.filter((r) => r.rating === filterStars)
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sortBy === 'highest') list.sort((a, b) => b.rating - a.rating)
    if (sortBy === 'lowest') list.sort((a, b) => a.rating - b.rating)
    if (sortBy === 'helpful') list.sort((a, b) => b.helpful - a.helpful)
    return list
  }, [reviews, sortBy, filterStars])

  const allCustomerPhotos = useMemo(() => {
    const photos = []
    reviews.forEach((r) => {
      if (r.photos && r.photos.length) {
        r.photos.forEach((src) => photos.push({ src, reviewName: r.name }))
      }
    })
    return photos
  }, [reviews])

  const submitReview = useCallback(() => {
    setFormError('')
    if (!formRating) { setFormError('Please select a star rating.')
      return }
    if (!formName.trim()) { setFormError('Please enter your name.')
      return }
    if (!formText.trim()) { setFormError('Please share your experience.')
      return }
    if (formPhotos.length > 5) { setFormError('You can upload up to 5 photos.')
      return }
    setFormSubmitting(true)
    setTimeout(() => {
      setFormSubmitting(false)
      setFormSuccess(true)
      setFormName('')
      setFormRating(0)
      setFormText('')
      setFormPhotos([])
      setTimeout(() => setFormSuccess(false), 4000)
    }, 1200)
  }, [formRating, formName, formText, formPhotos.length])

  return (
    <section className="container-page mt-16 pt-14 pb-12 border-t border-sand/60" aria-label="Customer Reviews">
      <h2 className="heading-display text-3xl">Customer Reviews</h2>
      <p className="mt-2 text-muted max-w-xl">See what our customers think about this creation.</p>

      {/* ====== RATING SUMMARY ====== */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[13rem_1fr] lg:gap-14 items-start">
        <div className="w-full sm:w-56">
          <div className="text-5xl font-display text-plum">{avg.toFixed(1)}</div>
          <div className="mt-1"><StarRating rating={avg} size="lg" /></div>
          <p className="text-sm text-muted mt-2">Based on {total} review{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="w-full space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] || 0
            const pct = total ? (count / total) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-3 font-semibold text-plum">{star}</span>
                <Star className="h-3.5 w-3.5 fill-bloom text-bloom shrink-0" aria-hidden="true" />
                <div className="flex-1 h-2.5 rounded-full bg-sand overflow-hidden">
                  <div
                    className="h-full rounded-full bg-bloom transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted tabular-nums">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ====== CUSTOMER PHOTO GALLERY ====== */}
      <div className="mt-14">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-display text-xl text-plum">Customer Photos</h3>
          {allCustomerPhotos.length > 5 && (
            <button
              onClick={() => openLightbox(allCustomerPhotos.map(p => p.src), 0)}
              className="text-sm font-semibold text-bloom hover:text-plum transition underline underline-offset-4"
              aria-label={`View all ${allCustomerPhotos.length} customer photos`}
            >
              View All Photos
            </button>
          )}
        </div>

        {allCustomerPhotos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-ivory/40 p-8 text-center">
            <Camera className="mx-auto h-8 w-8 text-sand" aria-hidden="true" />
            <p className="mt-2 text-sm text-muted">No customer photos yet. Be the first to share how this creation looks!</p>
          </div>
        ) : allCustomerPhotos.length <= 5 ? (
          /* Compact equal-width grid when 5 or fewer photos */
          <div className="grid grid-cols-5 gap-2">
            {allCustomerPhotos.map((photo, i) => (
              <button
                key={`${photo.reviewName}-${i}`}
                type="button"
                onClick={() => openLightbox(allCustomerPhotos.map(p => p.src), i)}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-sand focus:outline-none focus:ring-2 focus:ring-bloom/40"
                aria-label={`View customer photo by ${photo.reviewName}`}
              >
                <img
                  src={photo.src}
                  alt={`Customer photo by ${photo.reviewName}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : (
          /* Premium collage: large featured + 2×2 grid + +N overlay */
          <div className="flex flex-col gap-2 lg:flex-row">
            {/* Large featured photo — left column */}
            <button
              type="button"
              onClick={() => openLightbox(allCustomerPhotos.map(p => p.src), 0)}
              className="group relative w-full aspect-[4/3] lg:aspect-auto lg:w-1/2 lg:h-80 overflow-hidden rounded-2xl bg-sand focus:outline-none focus:ring-2 focus:ring-bloom/40"
              aria-label={`View customer photo by ${allCustomerPhotos[0].reviewName}`}
            >
              <img
                src={allCustomerPhotos[0].src}
                alt={`Customer photo by ${allCustomerPhotos[0].reviewName}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <span className="absolute bottom-2 left-2 rounded-full bg-plum/70 px-2 py-0.5 text-[10px] font-semibold text-cream backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {allCustomerPhotos[0].reviewName}
              </span>
            </button>

            {/* Right column: 2×2 grid */}
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => {
                const photo = allCustomerPhotos[i]
                if (!photo) return null
                const isLastVisible = i === 4
                const remaining = allCustomerPhotos.length - 5
                return (
                  <button
                    key={`${photo.reviewName}-${i}`}
                    type="button"
                    onClick={() =>
                      openLightbox(
                        allCustomerPhotos.map((p) => p.src),
                        i
                      )
                    }
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-sand focus:outline-none focus:ring-2 focus:ring-bloom/40"
                    aria-label={
                      isLastVisible && remaining > 0
                        ? `View ${remaining} more customer photos`
                        : `View customer photo by ${photo.reviewName}`
                    }
                  >
                    <img
                      src={photo.src}
                      alt={`Customer photo by ${photo.reviewName}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    {isLastVisible && remaining > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-plum/40 backdrop-blur-[1px] transition-colors group-hover:bg-plum/50">
                        <span className="font-display text-2xl text-cream drop-shadow-sm">
                          +{remaining}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ====== SORT + FILTER ====== */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-ivory ring-1 ring-sand px-3 py-2 text-sm">
          <Filter className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          <label htmlFor="rev-sort" className="text-xs font-semibold text-muted">Sort</label>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Most Recent' },
              { value: 'highest', label: 'Highest Rated' },
              { value: 'lowest', label: 'Lowest Rated' },
              { value: 'helpful', label: 'Most Helpful' },
            ]}
            className="!min-w-[10rem]"
            aria-label="Sort reviews"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[0, 5, 4, 3, 2, 1].map((star) => {
            const label = star === 0 ? 'All' : `${star} ★`
            const active = filterStars === star
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterStars(active ? 0 : star)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-plum text-cream shadow-soft'
                    : 'bg-ivory text-muted ring-1 ring-sand hover:text-plum hover:ring-bloom/30'
                )}
                aria-pressed={active}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ====== REVIEW LIST ====== */}
      <div className="mt-8 space-y-6">
        {sorted.length === 0 ? (
          <div className="rounded-3xl bg-ivory/50 p-8 text-center">
            <p className="text-muted">No reviews match the current filters. Try changing the filter.</p>
            <button
              onClick={() => { setFilterStars(0); setSortBy('newest') }}
              className="mt-3 text-sm font-semibold text-bloom hover:text-plum underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          sorted.map((review) => (
            <article key={review.id} className="paper-card p-6 md:p-8">
              {/* Demo label */}
              {review.isSample && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sage mb-2">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Sample Review
                </span>
              )}

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-lg text-plum">{review.name}</h4>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bloom/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-bloom">
                        <Check className="h-3 w-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <StarRating rating={review.rating} size="sm" />
                    <span aria-hidden="true">·</span>
                    <time dateTime={review.date}>{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  </div>
                </div>
                <div className="text-xs text-muted whitespace-nowrap">{review.place || 'Verified'}</div>
              </div>

              {review.title && (
                <h5 className="mt-3 font-display text-base text-plum">{review.title}</h5>
              )}

              <blockquote className="mt-3 leading-relaxed text-muted max-w-prose">"{review.text}"</blockquote>

              {/* Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {review.photos.map((photo, pi) => (
                    <button
                      key={pi}
                      type="button"
                      onClick={() => openLightbox(review.photos, pi)}
                      className="h-20 w-20 overflow-hidden rounded-xl ring-1 ring-sand hover:ring-bloom/40 transition focus:outline-none focus:ring-2 focus:ring-bloom/40 shrink-0"
                      aria-label={`View full photo ${pi + 1} from review by ${review.name}`}
                    >
                      <img src={photo} alt={`Review photo by ${review.name}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition shadow-soft',
                    helpful[review.id]
                      ? 'bg-bloom/15 text-bloom ring-1 ring-bloom/20'
                      : 'bg-ivory text-muted ring-1 ring-sand hover:text-plum hover:ring-bloom/30'
                  )}
                  aria-label={`Mark review by ${review.name} as helpful`}
                  aria-pressed={!!helpful[review.id]}
                >
                  <ThumbsUp className={cn('h-3.5 w-3.5', helpful[review.id] && 'fill-bloom')} aria-hidden="true" />
                  Helpful {review.helpful + (helpful[review.id] ? 1 : 0)}
                </button>
                <button
                  onClick={() => {
                    alert(`Report submitted for moderation. The review by ${review.name} has been flagged.`)
                  }}
                  className="text-xs text-muted underline underline-offset-2 transition hover:text-bloom"
                  aria-label={`Report review by ${review.name}`}
                >
                  Report
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* ====== LOAD MORE (simulated with demo data) ====== */}
      {sorted.length > 0 && sorted.length >= reviews.length && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">These are sample reviews for demonstration. Real customer reviews will replace them.</p>
        </div>
      )}

      {/* ====== LIGHTBOX ====== */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-plum/20 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Customer photo viewer"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close photo viewer"
            className="absolute top-5 right-5 rounded-full bg-cream/90 p-2.5 text-plum shadow-md hover:bg-cream transition z-10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevImg() }}
            aria-label="Previous photo"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-3 text-plum shadow-md hover:bg-cream transition z-10"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextImg() }}
            aria-label="Next photo"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 p-3 text-plum shadow-md hover:bg-cream transition z-10"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <img
            src={lightbox.images[lightbox.index]}
            alt="Customer photo"
            className="max-h-[82vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {lightbox.images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-plum/70 px-4 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
