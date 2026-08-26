import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'
import { FlowerBurst } from '../ui/Decor'
import { useLockBody, useScrolled } from '../../hooks/useScrolled'
import { cn } from '../../utils/cn'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-plum">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush/80">
        <FlowerBurst className="h-6 w-6 text-bloom" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg sm:text-xl">Jamae's</span>
        <span className="-mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted">
          Craftopia
        </span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  useLockBody(open)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition duration-300',
        scrolled || open
          ? 'border-b border-sand/70 bg-cream/90 shadow-soft backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between sm:h-[4.5rem]" aria-label="Primary">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-ivory text-plum' : 'text-muted hover:bg-ivory/80 hover:text-plum',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden lg:block">
          <Button as={Link} to="/shop" size="sm">
            Shop Handmade
          </Button>
        </div>
        <button
          type="button"
          className="rounded-full p-2 text-plum transition hover:bg-ivory lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-sand/70 bg-cream lg:hidden"
          >
            <div className="container-page flex flex-col gap-2 py-6">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-2xl px-4 py-3 text-lg font-semibold',
                      isActive ? 'bg-ivory text-plum' : 'text-plum hover:bg-ivory/80',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Button as={Link} to="/shop" className="mt-2 w-full" onClick={() => setOpen(false)}>
                Shop Handmade
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
