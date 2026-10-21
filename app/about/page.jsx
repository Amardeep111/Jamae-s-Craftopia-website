import Link from 'next/link'
import { Heart, Leaf, Sparkles } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import CraftIllustration from '@/components/ui/CraftIllustration'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading'

const values = [
  {
    icon: Heart,
    title: 'Made with care',
    text: 'We would rather make fewer pieces well than rush a shelf full of almosts.',
  },
  {
    icon: Sparkles,
    title: 'Personal, not mass-made',
    text: 'Names, colours, and tiny requests are welcomed — they are the point.',
  },
  {
    icon: Leaf,
    title: 'Home-grown',
    text: 'A small practice in Siliguri, grown from a shared love of yarn and giving.',
  },
]

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="The people behind the yarn"
        title="A home-grown craft table in Siliguri."
        description="Jamae's Craftopia is a handmade crochet and craft practice run by two sisters — creating soft things meant to be gifted, kept, and smiled at."
      />

      <section className="container-page grid items-center gap-12 pb-8 lg:grid-cols-2">
        <ScrollReveal>
          <div className="paper-card overflow-hidden p-4">
            <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <CraftIllustration visual="yarn" palette={['#D9CDE8', '#5A3D4A']} className="h-full" />
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <SectionHeading
            align="left"
            title="Our story"
            description="This space is for the real story of Jamae's Craftopia. Until the sisters add their own words, here is what we can say with care:"
          />
          <div className="mt-6 space-y-4 leading-relaxed text-muted">
            <p>
              Jamae's Craftopia began as a home-grown handmade business in Siliguri, India. Two sisters, a shared
              craft table, and a love of turning yarn into something someone can hold.
            </p>
            <p>
              The work is slow on purpose: amigurumi friends, flowers that do not wilt, initial keychains, hair
              pieces, and gifts that carry a name. Nothing here is meant to feel factory-made.
            </p>
            <p className="rounded-2xl bg-ivory px-4 py-3 text-sm italic text-plum">
              Personal names, photos, and longer memories can be added here whenever you are ready — this page is
              designed to hold them.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="container-page mt-16">
        <SectionHeading
          title="Meet the makers"
          description="Two sisters. One practice. Portraits can replace these frames with your own photographs."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            {
              label: 'Tina',
              visual: 'flower',
              palette: ['#E8B4B8', '#F7EFE6'],
              bio: 'Tina is a hardworking and caring creator who puts her heart into everything she does. Her supportive nature, creativity, and dedication shine through in every handmade piece, making each creation truly special and full of love.',
            },
            {
              label: 'Papia',
              visual: 'heart',
              palette: ['#D9CDE8', '#C96B7B'],
              bio: 'Papia is a sweet and thoughtful creator who pours love and creativity into every handmade piece. Her gentle nature and attention to detail make each creation feel personal, meaningful, and truly special.',
            },
          ].map((person, i) => (
            <ScrollReveal key={person.label} delay={i * 0.08}>
              <article className="paper-card overflow-hidden">
                <div className="aspect-[5/4]">
                  <CraftIllustration
                    visual={person.visual}
                    palette={person.palette}
                    className="h-full"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bloom">Maker</p>
                  <h3 className="mt-1 font-display text-3xl text-plum">{person.label}</h3>
                  <p className="mt-2 text-muted">{person.bio}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <SectionHeading title="What we hold close" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 0.06}>
              <article className="paper-card h-full p-6">
                <v.icon className="h-6 w-6 text-bloom" aria-hidden="true" />
                <h3 className="mt-4 font-display text-2xl text-plum">{v.title}</h3>
                <p className="mt-2 text-muted">{v.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="container-page mt-20 pb-20">
        <div className="grid items-center gap-10 rounded-[2rem] bg-ivory/80 p-8 ring-1 ring-sand lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="heading-display text-3xl sm:text-4xl">How a piece is made</h2>
            <ol className="mt-6 space-y-4 text-muted">
              <li>
                <strong className="text-plum">1. Yarn and a quiet idea.</strong> Colours are chosen to match a mood,
                a dress, or a memory.
              </li>
              <li>
                <strong className="text-plum">2. Stitch by stitch.</strong> Toys, petals, and letters take shape on
                the hook — never rushed.
              </li>
              <li>
                <strong className="text-plum">3. The small finishing.</strong> Embroidered faces, ribbons, wrapping,
                and a last look before it leaves the table.
              </li>
            </ol>
            <Button as={Link} href="/custom-orders" className="mt-8">
              Commission a piece
            </Button>
          </div>
          <div className="aspect-square overflow-hidden rounded-[1.75rem]">
            <CraftIllustration visual="bouquet" palette={['#F3C9B8', '#E8B4B8', '#C5D1C0']} className="h-full" />
          </div>
        </div>
      </section>
    </>
  )
}