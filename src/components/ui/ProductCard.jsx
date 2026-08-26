import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Badge from './Badge'
import ProductImage from './ProductImage'
import { formatPrice } from '../../data/products'
import { categories } from '../../data/categories'
import { cn } from '../../utils/cn'

export default function ProductCard({ product, className }) {
  const category = categories.find((c) => c.id === product.category)
  const photo = product.image || product.images?.[0]

  return (
    <article
      className={cn(
        'group paper-card flex h-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lift',
        className,
      )}
    >
      <Link to={`/shop/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-sand">
        <ProductImage
          src={photo}
          alt={product.name}
          visual={product.visual}
          palette={product.palette}
          className="h-full w-full"
        />
        <Badge className="absolute left-3 top-3">Handmade</Badge>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom">
          {category?.name}
        </p>
        <h3 className="mt-2 font-display text-2xl text-plum">
          <Link to={`/shop/${product.id}`} className="transition hover:text-bloom">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{product.short}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-semibold text-plum">{formatPrice(product.price)}</p>
          <Link
            to={`/shop/${product.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-plum transition hover:text-bloom"
          >
            View details
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
