import CraftIllustration from './CraftIllustration'
import { cn } from '../../utils/cn'

export default function ProductImage({
  src,
  alt,
  visual = 'yarn',
  palette,
  className,
  imgClassName,
}) {
  if (src) {
    return (
      <div className={cn('overflow-hidden', className)}>
        <img
          src={src}
          alt={alt}
          className={cn('h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105', imgClassName)}
        />
      </div>
    )
  }

  return (
    <CraftIllustration
      visual={visual}
      palette={palette}
      className={cn('h-full w-full transition duration-700 ease-out group-hover:scale-105', className)}
    />
  )
}
