import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-plum text-cream shadow-soft hover:bg-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0',
  secondary:
    'bg-ivory text-plum ring-1 ring-blush/80 hover:bg-blush/60 hover:-translate-y-0.5',
  blush:
    'bg-petal text-plum hover:bg-blush hover:-translate-y-0.5 shadow-soft',
  ghost: 'bg-transparent text-plum hover:bg-ivory',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  type,
  ...props
}) {
  return (
    <Component
      type={Component === 'button' ? type || 'button' : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition duration-300 ease-out',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
