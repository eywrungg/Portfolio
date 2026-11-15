import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import Section from '../components/Section'
import { BrandIcon } from '../lib/brandIcons'

const KoiPond = lazy(() => import('../components/KoiPond'))

const groups = [
  {
    title: 'Languages',
    items: [
      { label: 'JavaScript', mark: 'JS', color: '#f7df1e' },
      { label: 'TypeScript', mark: 'TS', color: '#3178c6' },
      { label: 'HTML5', mark: 'H5', color: '#e34f26' },
      { label: 'CSS3', mark: 'C3', color: '#1572b6' },
      { label: 'PHP', mark: 'PHP', color: '#777bb4' },
      { label: 'C++', mark: 'C++', color: '#00599c' },
      { label: 'C', mark: 'C', color: '#a8b9cc' },
      { label: 'Python', mark: 'PY', color: '#3776ab' },
    ],
  },
  {
    title: 'Frameworks',
    items: [
      { label: 'React', mark: 'R', color: '#61dafb' },
      { label: 'Laravel', mark: 'L', color: '#ff2d20' },
      { label: 'Blade', mark: 'B', color: '#f97316' },
      { label: 'Vue.js', mark: 'V', color: '#42b883' },
      { label: 'Tailwind', mark: 'TW', color: '#06b6d4' },
      { label: 'React Native', mark: 'RN', color: '#61dafb' },
    ],
  },
  {
    title: 'Engines & AR',
    items: [
      { label: 'Unity', mark: 'U', color: '#ffffff', bg: '#111111' },
      { label: 'ARCore', mark: 'AR', color: '#4285f4' },
      { label: 'ARKit', mark: 'AK', color: '#f5f5f7' },
      { label: 'ViroReact', mark: 'VR', color: '#61dafb' },
    ],
  },
  {
    title: 'State & Data',
    items: [
      { label: 'Supabase', mark: 'SB', color: '#3ecf8e' },
      { label: 'MySQL', mark: 'DB', color: '#4479a1' },
      { label: 'REST API', mark: 'API', color: '#a855f7' },
      { label: 'Axios', mark: 'AX', color: '#5a29e4' },
    ],
  },
  {
    title: 'Tools & Testing',
    items: [
      { label: 'Git', mark: 'G', color: '#f05032' },
      { label: 'Vite', mark: 'V', color: '#646cff' },
      { label: 'NPM', mark: 'N', color: '#cb3837' },
      { label: 'Playwright', mark: 'PW', color: '#45ba4b' },
      { label: 'VS Code', mark: 'VS', color: '#007acc' },
    ],
  },
] as const

const creativeTools = [
  { label: 'CapCut', mark: 'CC', color: '#ffffff', bg: '#050505' },
  { label: 'Alight Motion', mark: 'AM', color: '#8cff4d', bg: '#102414' },
  { label: 'After Effects', mark: 'Ae', color: '#d8b4fe', bg: '#1e1240' },
  { label: 'Photoshop', mark: 'Ps', color: '#31a8ff', bg: '#001e36' },
  { label: 'Premiere Pro', mark: 'Pr', color: '#ea77ff', bg: '#2a0f3f' },
  { label: 'Lightroom', mark: 'Lr', color: '#31d7ff', bg: '#001e36' },
] as const

const experience = [
  { title: 'Capstone Developer', detail: 'Currently building Gabay AR navigation and Mentra APK', year: '2026', tone: '#c96a3b' },
  { title: 'App Developer', detail: 'Built PyroWatch APK and continuing mobile app work', year: '2026', tone: '#4b7496' },
  { title: 'Arduino IoT Maker', detail: 'Developed PyroWatch IoT hardware and fire safety prototype', year: '2026', tone: '#b88a42' },
  { title: 'Film Poster Designer', detail: 'Created poster designs for film projects', year: '2026', tone: '#8f5f78' },
  { title: 'System Developer', detail: 'Research leader with API usage and system development work', year: '2025', tone: '#7256c7' },
  { title: 'UI Designer', detail: 'System leader and developer for UI and project builds', year: '2024', tone: '#06b6d4' },
  { title: 'BS Information Technology', detail: "St. Mary's College of Bansalan", year: '2023', tone: '#5f9074' },
  { title: 'Hello World!', detail: 'Wrote Hello World using a phone', year: '2020', tone: '#f59e0b' },
] as const

function SkillMark({ item }: { item: { label: string; mark: string; color: string; bg?: string } }) {
  return (
    <span data-fish-icon="" className="flex h-10 min-w-10 items-center justify-center px-1">
      <span data-fish-icon-motion="" className="inline-flex"><BrandIcon label={item.label} size={21} /></span>
    </span>
  )
}

function PlayfulSkill({ item }: { item: { label: string; mark: string; color: string } }) {
  return (
    <button
      type="button"
      data-fish-food={item.label}
      data-fish-obstacle=""
      className="fish-food relative flex items-center gap-3 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`Let the koi investigate ${item.label}`}
      onClick={(event) => event.currentTarget.dispatchEvent(new CustomEvent('koi-feed', { bubbles: true, detail: item.label }))}
    >
      <SkillMark item={item} />
      <span className="font-mono text-xs uppercase tracking-[0.08em]" style={{ color: 'var(--ink-2)' }}>{item.label}</span>
    </button>
  )
}

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pondRef = useRef<HTMLDivElement>(null)
  const pondVisible = useInView(sectionRef, { margin: '120px' })
  const pondReady = useInView(sectionRef, { margin: '120px', once: true })
  const [activeExperience, setActiveExperience] = useState(0)

  useEffect(() => {
    const updateActiveExperience = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const viewport = window.innerHeight
      const scrollable = Math.max(1, rect.height - viewport * 0.45)
      const progress = Math.min(Math.max((viewport * 0.28 - rect.top) / scrollable, 0), 1)
      setActiveExperience(Math.round(progress * (experience.length - 1)))
    }

    updateActiveExperience()
    window.addEventListener('scroll', updateActiveExperience, { passive: true })
    window.addEventListener('resize', updateActiveExperience)
    return () => {
      window.removeEventListener('scroll', updateActiveExperience)
      window.removeEventListener('resize', updateActiveExperience)
    }
  }, [])

  return (
    <Section id="skills" className="relative isolate mx-auto max-w-6xl overflow-x-clip px-6 py-28">
      <div ref={pondRef} aria-hidden="true" className="pointer-events-none absolute -inset-x-3 inset-y-0 z-0 overflow-hidden sm:-inset-x-10">
        {pondReady && <Suspense fallback={null}><KoiPond hostRef={pondRef} active={pondVisible} /></Suspense>}
      </div>
      <div ref={sectionRef} className="relative z-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <div data-fish-obstacle="" className="mb-14">
            <p
              className="font-mono text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--accent)' }}
            >
              Technologies
            </p>
            <h2
              className="mt-5 text-6xl leading-none tracking-normal sm:text-7xl"
              style={{
                color: 'var(--ink)',
                fontFamily: '"Archivo Black", "Space Grotesk", sans-serif',
              }}
            >
              Stack & Code
            </h2>
          </div>

          <div>
            {groups.map((group) => (
              <div
                key={group.title}
                className="border-t py-9 first:border-t-0 first:pt-0"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <h3
                  data-fish-obstacle=""
                  className="text-3xl uppercase leading-none tracking-normal sm:text-4xl"
                  style={{
                    color: 'var(--accent)',
                    fontFamily: '"Archivo Black", "Space Grotesk", sans-serif',
                  }}
                >
                  {group.title}
                </h3>

                <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-5">
                  {group.items.map((item) => (
                    <PlayfulSkill key={item.label} item={item} />
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t py-9" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <h3
                data-fish-obstacle=""
                className="text-3xl uppercase leading-none tracking-normal sm:text-4xl"
                style={{
                  color: 'var(--accent)',
                  fontFamily: '"Archivo Black", "Space Grotesk", sans-serif',
                }}
              >
                Creative Tools
              </h3>

              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-5">
                {creativeTools.map((item) => (
                  <PlayfulSkill key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside
          data-fish-obstacle=""
          className="relative overflow-hidden border px-5 py-6 lg:sticky lg:top-24"
          style={{
            background: 'var(--card)',
            borderColor: 'color-mix(in srgb, var(--accent) 14%, var(--border))',
            boxShadow: '0 24px 60px color-mix(in srgb, black 16%, transparent)',
          }}
        >
          <h3
            className="relative text-2xl font-black tracking-normal"
            style={{ color: 'var(--ink)', fontFamily: '"Archivo Black", "Space Grotesk", sans-serif' }}
          >
            Experience
          </h3>

          <div className="relative mt-7 space-y-6">
            <span
              aria-hidden
              className="absolute bottom-2 left-[8px] top-2 w-px"
              style={{ background: 'color-mix(in srgb, var(--ink) 12%, transparent)' }}
            />
            {experience.map((item, index) => {
              const isActive = activeExperience === index
              return (
                <div
                  key={`${item.title}-${item.year}`}
                  className="relative grid grid-cols-[1.25rem_1fr_auto] gap-3 py-3 transition-all duration-300"
                  style={{
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <span
                    className="mt-1 h-4 w-4"
                    style={{
                      background: isActive ? item.tone : 'color-mix(in srgb, var(--ink) 14%, transparent)',
                      boxShadow: isActive ? `0 0 18px color-mix(in srgb, ${item.tone} 28%, transparent)` : 'none',
                    }}
                  />
                  <div>
                    <p className="text-[1.05rem] font-black leading-tight" style={{ color: 'var(--ink)' }}>
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-snug" style={{ color: 'var(--ink-2)' }}>
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className="self-center font-mono text-xs font-bold transition-colors duration-300"
                    style={{ color: isActive ? item.tone : 'var(--ink-3)' }}
                  >
                    {item.year}
                  </span>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </Section>
  )
}
