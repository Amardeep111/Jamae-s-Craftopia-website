import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '../ui/SocialIcons'
import { FlowerBurst } from '../ui/Decor'
import { shopCategories } from '../../data/categories'
import { site } from '../../data/site'

const quickLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-sand bg-ivory/70">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 text-plum">
            <FlowerBurst className="h-7 w-7 text-bloom" />
            <span className="font-display text-2xl">Jamae's Craftopia</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Little handmade things that bring big smiles — crocheted slowly in Siliguri, with love from two sisters.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-plum">Visit</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition hover:text-plum">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-plum">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {shopCategories.map((cat) => (
              <li key={cat.id}>
                <Link to={`/shop?category=${cat.slug}`} className="transition hover:text-plum">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-plum">Find us</h2>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bloom" aria-hidden="true" />
            {site.location}
          </p>
          <p className="mt-2 text-sm text-muted">{site.email}</p>
          <p className="mt-1 text-sm text-muted">{site.phone}</p>
          <div className="mt-4 flex gap-2">
            <a
              href={site.social.instagram}
              className="rounded-full bg-cream p-2 text-plum transition hover:bg-blush"
              aria-label="Instagram (placeholder)"
            >
              <InstagramIcon />
            </a>
            <a
              href={site.social.facebook}
              className="rounded-full bg-cream p-2 text-plum transition hover:bg-blush"
              aria-label="Facebook (placeholder)"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-sand py-5 text-center text-sm text-muted">
        © {new Date().getFullYear()} Jamae's Craftopia. Handmade in Siliguri, with love.
      </div>
    </footer>
  )
}
