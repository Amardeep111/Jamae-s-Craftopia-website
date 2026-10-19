'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { categories } from '@/data/categories'
import { products } from '@/data/products'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import ProductCard from '@/components/ui/ProductCard'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/cn'

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
  const [catalog, setCatalog] = useState(products)

  useEffect(() => {
    let active = true
    fetch('/api/products?limit=500', { cache: 'no-store' }).then((response) => response.json()).then((result) => {
      if (active && result.success && Array.isArray(result.data)) setCatalog(result.data)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const setCategory = (slug) => {
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') params.delete('category')
    else params.set('category', slug)
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = catalog.filter((p) => (category === 'all' ? true : p.category === category))
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
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

        <div className="relative z-10 mt-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'relative z-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                category === cat.slug
                  ? 'bg-plum text-cream'
                  : 'bg-ivory text-plum ring-1 ring-sand hover:bg-blush/50',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
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
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function Shop() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  )
}
