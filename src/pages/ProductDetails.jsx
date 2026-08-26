import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { categories } from '../data/categories'
import { formatPrice, getProductById, getRelatedProducts } from '../data/products'
import { site } from '../data/site'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ProductCard from '../components/ui/ProductCard'
import ProductImage from '../components/ui/ProductImage'
import EmptyState from '../components/ui/EmptyState'

export default function ProductDetails() {
  const { productId } = useParams()
  const product = getProductById(productId)
  const [qty, setQty] = useState(1)
  const [active, setActive] = useState(0)
  const [orderOpen, setOrderOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)

  const related = useMemo(() => (product ? getRelatedProducts(product) : []), [product])
  const category = product ? categories.find((c) => c.id === product.category) : null

  const gallery = product
    ? [product.image, ...(product.images || [])].filter(Boolean)
    : []

  if (!product) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="This piece is not on the shelf"
          description="It may have been a mistyped link. Wander back to the shop to find something lovely."
          action={
            <Button as={Link} to="/shop">
              Back to shop
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page pb-20 pt-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/shop" className="inline-flex items-center gap-1 font-semibold text-plum hover:text-bloom">
          <ChevronLeft className="h-4 w-4" />
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-plum">
          {category?.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-plum">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="paper-card aspect-square overflow-hidden">
            {gallery.length > 0 ? (
              <ProductImage src={gallery[active]} alt={product.name} className="h-full w-full" />
            ) : (
              <ProductImage
                alt={product.name}
                visual={product.visual}
                palette={product.palette}
                className="h-full w-full"
              />
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-4 flex gap-3">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-16 w-16 overflow-hidden rounded-2xl ring-2 ${
                    active === i ? 'ring-bloom' : 'ring-transparent'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <ProductImage src={src} alt="" className="h-full w-full" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <Badge>Handmade</Badge>
          <h1 className="heading-display mt-3 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-bloom">{category?.name}</p>
          <p className="mt-4 text-2xl font-semibold text-plum">{formatPrice(product.price)}</p>
          <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

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

          <div className="mt-8 flex flex-wrap items-center gap-4">
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
            <Button onClick={() => setOrderOpen(true)}>Order This Creation</Button>
            <Button variant="secondary" onClick={() => setCustomOpen(true)}>
              Ask for Customization
            </Button>
          </div>
        </div>
      </div>

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

      <Modal open={orderOpen} title="Let’s finish this by hand" onClose={() => setOrderOpen(false)}>
        <p className="text-muted">
          Online checkout is coming soon. For now, send a note with <strong>{product.name}</strong> (qty {qty})
          and we will take care of the rest.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button as="a" href={site.whatsapp} target="_blank" rel="noreferrer">
            Message on WhatsApp
          </Button>
          <Button as={Link} to="/contact" variant="secondary" onClick={() => setOrderOpen(false)}>
            Use the contact form
          </Button>
        </div>
      </Modal>

      <Modal open={customOpen} title="A more personal version" onClose={() => setCustomOpen(false)}>
        <p className="text-muted">
          Tell us the colour, size, or tiny detail you are dreaming of. We will reply with what is possible.
        </p>
        <div className="mt-6">
          <Button as={Link} to="/custom-orders" onClick={() => setCustomOpen(false)}>
            Start a custom request
          </Button>
        </div>
      </Modal>
    </div>
  )
}
