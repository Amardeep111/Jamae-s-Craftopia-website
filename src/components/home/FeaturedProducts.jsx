import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../../data/products'
import Button from '../ui/Button'
import ProductCard from '../ui/ProductCard'
import ScrollReveal from '../ui/ScrollReveal'
import SectionHeading from '../ui/SectionHeading'

export default function FeaturedProducts() {
  const featured = getFeaturedProducts().slice(0, 8)

  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading
        eyebrow="On the table right now"
        title="Featured creations"
        description="A handful of pieces we love — each one handmade, each one a little different from the last."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product, i) => (
          <ScrollReveal key={product.id} delay={i * 0.04}>
            <ProductCard product={product} />
          </ScrollReveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button as={Link} to="/shop" variant="secondary">
          See the full collection
        </Button>
      </div>
    </section>
  )
}
