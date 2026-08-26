import ScrollReveal from '../ui/ScrollReveal'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  {
    n: '01',
    title: 'Share Your Idea',
    text: 'A photo, a colour, a sketch, or a sentence is enough to begin.',
  },
  {
    n: '02',
    title: 'We Create the Magic',
    text: 'We plan the stitches, choose the yarn, and keep you in the loop.',
  },
  {
    n: '03',
    title: 'Your Piece Comes to Life',
    text: 'Loop by loop, the toy, flower, or gift becomes something you can hold.',
  },
  {
    n: '04',
    title: 'Made With Love, Just for You',
    text: 'Packed with care in Siliguri, ready to be gifted or kept close.',
  },
]

export default function HowItWorks() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading
        eyebrow="A gentle process"
        title="How it works"
        description="No rush, no mystery — just a kind path from idea to handmade piece."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <ScrollReveal key={step.n} delay={i * 0.06}>
            <article className="paper-card h-full p-6">
              <p className="font-display text-3xl text-petal">{step.n}</p>
              <h3 className="mt-3 font-display text-2xl text-plum">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
