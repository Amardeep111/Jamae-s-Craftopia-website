import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function FinalCTA() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <div className="rounded-[2rem] bg-blush/50 px-6 py-14 text-center ring-1 ring-blush sm:px-12">
        <h2 className="heading-display mx-auto max-w-2xl text-3xl sm:text-5xl">
          Ready to find something made especially for you?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          Wander the collection, or tell us what you have been imagining. We would love to make it.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button as={Link} to="/shop" size="lg">
            Shop Now
          </Button>
          <Button as={Link} to="/custom-orders" variant="secondary" size="lg">
            Create Something Custom
          </Button>
        </div>
      </div>
    </section>
  )
}
