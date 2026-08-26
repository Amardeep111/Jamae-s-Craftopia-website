import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import CraftIllustration from '../ui/CraftIllustration'

export default function CustomOrderCTA() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-plum via-[#6a4860] to-[#4a342c] px-6 py-12 text-cream sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-petal/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-lavender/20 blur-2xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-petal">A piece that does not exist yet</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-5xl">
              Have something special in mind? Let’s bring it to life.
            </h2>
            <p className="mt-4 max-w-lg text-cream/80">
              Your idea, our yarn, a little bit of magic. Share a colour, a character, or an occasion — and we will
              crochet something that could only belong to you.
            </p>
            <Button as={Link} to="/custom-orders" variant="blush" className="mt-8">
              Start Your Custom Order
            </Button>
          </div>
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-cream/10 ring-1 ring-cream/15">
            <div className="aspect-square">
              <CraftIllustration visual="yarn" palette={['#E8B4B8', '#F7EFE6']} className="h-full from-petal/40 to-lavender/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
