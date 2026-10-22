'use client'

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import ProductCard from '@/components/ui/ProductCard'
import Select from '@/components/ui/Select'
import SkeletonCard from '@/components/ui/SkeletonCard'
import { shopCategories } from '@/data/categories'
import { products as sampleProducts } from '@/data/products'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'

const PAGE_SIZE = 12

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')

  // Instant initial render: show sample catalog & categories immediately
  const [catalog, setCatalog] = useState(() => sampleProducts)
  const [categories, setCategories] = useState(() => shopCategories)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  // Infinite scroll sentinel
  const [sentinelRef, sentinelInView] = useInView({ rootMargin: '450px', once: false })
  const fetchingRef = useRef(false)

  // Background non-blocking reconciliation for categories
  useEffect(() => {
    let active = true
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Fetch initial batch whenever category changes (non-blocking)
  useEffect(() => {
    let active = true
    fetchingRef.current = true
    setError(null)

    const params = new URLSearchParams()
    params.set('limit', String(PAGE_SIZE))
    params.set('skip', '0')
    if (category !== 'all') params.set('category', category)

    fetch(`/api/products?${params.toString()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((result) => {
        if (!active) return
        if (result?.success && Array.isArray(result.data)) {
          setCatalog(result.data)
          setHasMore(Boolean(result.hasMore))
        }
      })
      .catch(() => {
        if (active) setError('Could not refresh products.')
      })
      .finally(() => {
        if (active) {
          setLoadingInitial(false)
          fetchingRef.current = false
        }
      })

    return () => { active = false }
  }, [category])

  // Load more on scroll when approaching bottom
  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasMore || loadingMore) return
    fetchingRef.current = true
    setLoadingMore(true)

    const params = new URLSearchParams()
    params.set('limit', String(PAGE_SIZE))
    params.set('skip', String(catalog.length))
    if (category !== 'all') params.set('category', category)

    fetch(`/api/products?${params.toString()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((result) => {
        if (result?.success && Array.isArray(result.data)) {
          if (result.data.length === 0) {
            setHasMore(false)
          } else {
            setCatalog((prev) => {
              const existingIds = new Set(prev.map((p) => p.id))
              const fresh = result.data.filter((p) => !existingIds.has(p.id))
              return [...prev, ...fresh]
            })
            setHasMore(Boolean(result.hasMore))
          }
        } else {
          setHasMore(false)
        }
      })
      .catch(() => {
        setHasMore(false)
      })
      .finally(() => {
        setLoadingMore(false)
        fetchingRef.current = false
      })
  }, [hasMore, loadingMore, catalog.length, category])

  useEffect(() => {
    if (sentinelInView && hasMore && !loadingMore && !fetchingRef.current) {
      loadMore()
    }
  }, [sentinelInView, hasMore, loadingMore, loadMore])

  const setCategory = (slug) => {
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') params.delete('category')
    else params.set('category', slug)
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = catalog.filter((p) => {
      if (category === 'all') return true
      return (p.category?.slug || p.categorySlug || p.categoryId || p.category) === category
    })
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.short?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
    }
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'featured') list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured))
    return list
  }, [catalog, category, query, sort])

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title="Shop handmade pieces"
        description="Browse toys, flowers, accessories, and custom-ready keepsakes. Filter by what you are in the mood for."
      />
      <div className="container-page pb-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Search creations</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bears, roses, initials…"
              className="w-full rounded-full border border-sand bg-ivory py-3 pl-11 pr-4 text-sm text-ink outline-none ring-bloom/30 transition focus:ring-2"
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-muted">
            Sort
            <Select
              value={sort}
              onChange={setSort}
              options={sortOptions}
              className="w-48"
            />
          </label>
        </div>

        <div className="relative z-10 mt-2 pt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categories">
          <button
            type="button"
            role="tab"
            aria-selected={category === 'all'}
            onClick={() => setCategory('all')}
            className={cn(
              'relative z-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
              category === 'all' ? 'bg-plum text-cream' : 'bg-ivory text-plum ring-1 ring-sand hover:bg-blush/50',
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'relative z-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                category === cat.slug ? 'bg-plum text-cream' : 'bg-ivory text-plum ring-1 ring-sand hover:bg-blush/50',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 && !loadingInitial ? (
          <div className="mt-12">
            <EmptyState
              title="Nothing matches just yet"
              description="Try another word, or clear the search to see the full shelf."
              action={
                <button
                  type="button"
                  className="font-semibold text-plum underline-offset-4 hover:underline"
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                  }}
                >
                  Reset filters
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load on scroll sentinel */}
            <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />

            {loadingMore && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-ivory px-4 py-2 text-xs font-semibold text-plum shadow-soft ring-1 ring-sand">
                  <span className="h-2 w-2 rounded-full bg-bloom animate-ping" />
                  Loading more creations…
                </div>
              </div>
            )}

            {!hasMore && filtered.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted/60">
                  ✦ You've reached the end of the collection ✦
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="container-page pb-16 pt-8">
        <PageHeader eyebrow="The collection" title="Shop handmade pieces" description="Browse toys, flowers, accessories, and custom-ready keepsakes." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
