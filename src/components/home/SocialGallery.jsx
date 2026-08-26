import { InstagramIcon } from '../ui/SocialIcons'
import { galleryItems } from '../../data/testimonials'
import { site } from '../../data/site'
import ProductImage from '../ui/ProductImage'
import SectionHeading from '../ui/SectionHeading'

export default function SocialGallery() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading
        eyebrow="On the feed"
        title="Follow our creative journey"
        description="A peek at the table — yarn, blooms, and little creatures in progress."
      />
      <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
        {galleryItems.map((item) => (
          <figure
            key={item.id}
            className="mb-4 break-inside-avoid overflow-hidden rounded-3xl shadow-soft"
          >
            <div className={item.tall ? 'aspect-[3/4]' : 'aspect-square'}>
              <ProductImage alt={item.label} visual={item.visual} className="h-full w-full" />
            </div>
            <figcaption className="sr-only">{item.label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-8 text-center">
        <a
          href={site.social.instagram}
          className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-semibold text-plum ring-1 ring-blush/80 transition hover:bg-blush/50"
        >
          <InstagramIcon className="h-4 w-4" />
          Follow along on Instagram
        </a>
      </div>
    </section>
  )
}
