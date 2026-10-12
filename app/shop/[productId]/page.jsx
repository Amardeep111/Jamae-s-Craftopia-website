'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus, Flower2 } from 'lucide-react'
import { useCartStore } from '@/lib/cart'
import { categories } from '@/data/categories'
import { formatPrice, getProductById, getRelatedProducts } from '@/data/products'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProductCard from '@/components/ui/ProductCard'
import ProductImageGallery from '@/components/ui/ProductImageGallery'
import CustomerReviews from '@/components/ui/CustomerReviews'

export default function ProductDetails({ params }) {
  const { productId } = use(params)
  const product = getProductById(productId)
  const [qty, setQty] = useState(1)
  const [customOpen, setCustomOpen] = useState(false)
  const [addedConfirm, setAddedConfirm] = useState(false)
  const [goToBag, setGoToBag] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const related = useMemo(() => (product ? getRelatedProducts(product) : []), [product])
  const category = product ? categories.find((c) => c.id === product.category) : null

  if (!product) {
    return (
      <div className="container-page py-20">
        <div className="paper-card mx-auto max-w-lg px-8 py-14 text-center">
          <Flower2 className="mx-auto h-10 w-10 text-petal" aria-hidden="true" />
          <h2 className="mt-4 font-display text-3xl text-plum">This piece is not on the shelf</h2>
          <p className="mt-3 text-muted">
            It may have been a mistyped link. Wander back to the shop to find something lovely.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream shadow-soft transition hover:bg-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
          >
            Back to shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container-page pb-20 pt-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 font-semibold text-plum hover:text-bloom"
          >
            <ChevronLeft className="h-4 w-4" />
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-plum">
            {category?.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-plum">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div>
            <ProductImageGallery product={product} />
          </div>

          {/* Info */}
          <div>
            <Badge>Handmade</Badge>
            <h1 className="heading-display mt-3 text-4xl sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-bloom">
              {category?.name}
            </p>
            <p className="mt-4 text-2xl font-semibold text-plum">{formatPrice(product.price)}</p>
            <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

            {/* Details */}
            <div className="mt-8 space-y-4 rounded-3xl bg-ivory/80 p-5">
              <div>
                <h2 className="font-semibold text-plum">Customization</h2>
                <p className="mt-1 text-sm text-muted">{product.customization}</p>
              </div>
              <div>
                <h2 className="font-semibold text-plum">Materials</h2>
                <p className="mt-1 text-sm text-muted">{product.materials}</p>
              </div>
              <div>
                <h2 className="font-semibold text-plum">Care</h2>
                <p className="mt-1 text-sm text-muted">{product.care}</p>
              </div>
            </div>

            {/* Purchase controls */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Quantity */}
              <div className="inline-flex items-center rounded-full bg-ivory ring-1 ring-sand">
                <button
                  type="button"
                  className="p-3 text-plum"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center font-semibold" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="p-3 text-plum"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={() => {
                  if (goToBag) {
                    window.location.href = '/cart'
                    return
                  }
                  try {
                    addItem(product, qty)
                    setAddedConfirm(true)
                    setGoToBag(false)
                    setTimeout(() => {
                      setAddedConfirm(false)
                      setGoToBag(true)
                    }, 1200)
                  } catch (_) {
                    // Keep button usable
                  }
                }}
                variant="outline"
                className="border-plum/40 ring-1 ring-plum/10 hover:border-plum/60 hover:ring-plum/20 hover:shadow-[0_2px_8px_rgba(95,45,75,0.08)] focus:ring-plum/30 active:border-plum/70"
              >
                {goToBag ? 'Go to Bag' : addedConfirm ? 'Added to Bag' : 'Add to Cart'}
              </Button>

              {/* Buy Now */}
              <Button
                onClick={() => {
                  addItem(product, qty)
                  window.location.href = '/checkout'
                }}
              >
                Buy Now
              </Button>

              {/* Customization */}
              <Button variant="secondary" onClick={() => setCustomOpen(true)}>
                Ask for Customization
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 ? (
          <section className="mt-20">
            <h2 className="heading-display text-3xl">You might also love</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Customization Modal */}
        <Modal open={customOpen} title="A more personal version" onClose={() => setCustomOpen(false)}>
          <p className="text-muted">
            Tell us the colour, size, or tiny detail you are dreaming of. We will reply with what is possible.
          </p>
          <div className="mt-6">
            <Link
              href="/custom-orders"
              onClick={() => setCustomOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream shadow-soft transition hover:bg-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
            >
              Start a custom request
            </Link>
          </div>
        </Modal>
      </div>

      {/* Customer Reviews — below product, above closing fragment */}
      <CustomerReviews product={product} />
    </>
  )
}
