'use client'

import { useEffect, useState } from 'react'
import CategoryCard from '../ui/CategoryCard'
import ScrollReveal from '../ui/ScrollReveal'
import SectionHeading from '../ui/SectionHeading'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) setCategories(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading
        eyebrow="Wander the shelves"
        title="Shop by category"
        description="Find a small treasure, or start with a feeling — toys, flowers, keepsakes, and custom magic."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => (
          <ScrollReveal key={category.id || category.slug} delay={i * 0.05}>
            <CategoryCard category={{ ...category, id: category.slug || category.id }} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}