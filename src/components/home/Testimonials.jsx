import { testimonials } from '../../data/testimonials'
import ScrollReveal from '../ui/ScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import TestimonialCard from '../ui/TestimonialCard'

export default function Testimonials() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading
        eyebrow="Soft words"
        title="Customer love"
        description="A few notes from people who took a handmade piece home."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <ScrollReveal key={t.id} delay={i * 0.06}>
            <TestimonialCard testimonial={t} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
