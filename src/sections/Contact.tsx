import { ArrowUpRight } from 'lucide-react'
import Section from '../components/Section'
import DoodleCrewFooter, { type CrewMember, type DoodleKind } from '../components/ui/doodle-crew-footer'

const EMAIL = 'charlesarone@example.com'

const marqueeItems = [
  'Union, Bansalan',
  'Charles Arone Alcebar',
  'Fullstack Developer',
  'Creative Builder',
]

const crew: CrewMember[] = [
  { kind: 'yeti', letter: 0, seat: 'front', offset: -0.3, name: 'Builder', says: 'Have an idea? Let’s make it real.' },
  { kind: 'bird', letter: 1, seat: 'top', name: 'Scout', says: 'I found the next project!' },
  { kind: 'kid', letter: 2, seat: 'top', name: 'Maker', says: 'Let’s build something great.' },
  { kind: 'ghost', letter: 3, seat: 'behind', name: 'Pixel', says: 'There’s more to explore.' },
  { kind: 'cat', letter: 4, seat: 'front', offset: 0.25, flip: true, name: 'Patch', says: 'See you on GitHub.' },
]

const doodles: DoodleKind[] = ['star', 'bolt', 'sparkle', 'plane']

export default function Contact() {
  return (
    <Section id="contact" className="px-0 pb-12 pt-0">
      <div className="px-6 py-24 text-center sm:py-28" style={{ background: 'var(--accent)', color: '#050505' }}>
        <h2 className="sr-only">Let’s build something great</h2>
        <p className="mx-auto max-w-5xl text-[clamp(1.5rem,3vw,2.8rem)] uppercase leading-none tracking-normal" style={{ fontFamily: '"Archivo Black", "Space Grotesk", sans-serif' }}>Let’s</p>
        <div className="mx-auto max-w-5xl">
          <DoodleCrewFooter
            headlineOnly
            wordmark="BUILD"
            crew={crew}
            doodles={doodles}
            doodleCount={7}
            tagline=""
            actions={[]}
            palette={{ background: 'var(--accent)', ink: '#050505', accent: '#ffffff' }}
            fontFamily={'"Archivo Black", "Space Grotesk", sans-serif'}
            height="auto"
          />
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-[clamp(2.3rem,7vw,6rem)] uppercase leading-[0.95] tracking-normal" style={{ fontFamily: '"Archivo Black", "Space Grotesk", sans-serif' }}>
          Something great
        </p>

        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center justify-center border px-8 py-4 text-base font-black uppercase" style={{ background: '#050505', borderColor: '#050505', color: '#fff' }}>
            Get in touch
          </a>
          <a href="https://github.com/eywrungg" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 border px-8 py-4 text-base font-black uppercase" style={{ borderColor: '#050505', color: '#050505' }}>
            View GitHub <ArrowUpRight size={18} />
          </a>
        </div>
      </div>

      <div className="overflow-hidden py-7" style={{ background: '#050505' }}>
        <div className="flex w-max items-center gap-6" style={{ animation: 'marquee 24s linear infinite' }}>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="text-3xl font-black uppercase tracking-normal opacity-20 sm:text-4xl" style={{ color: '#fff', fontFamily: '"Archivo Black", "Space Grotesk", sans-serif' }}>
              {item} *
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}
