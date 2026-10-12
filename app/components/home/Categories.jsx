import { shopCategories } from '@/data/categories'
import CategoryCard from '../ui/CategoryCard'
import ScrollReveal from '../ui/ScrollReveal'
import SectionHeading from '../ui/SectionHeading'

export default function Categories() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading
        eyebrow="Wander the shelves"
        title="Shop by category"
        description="Find a small treasure, or start with a feeling — toys, flowers, keepsakes, and custom magic."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shopCategories.map((category, i) => (
          <ScrollReveal key={category.id} delay={i * 0.05}>
            <CategoryCard category={category} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}