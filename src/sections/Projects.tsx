import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight, ChevronDown, X } from 'lucide-react'
import { IconFolder, type FolderIcon } from '../components/ui/icon-folder'
import { AnimatedText } from '../components/ui/animated-text'
import Section from '../components/Section'
import { allProjects, projects, type Project } from '../data/projects'
import { BrandIcon, getBrandAccent } from '../lib/brandIcons'
import { useTheme } from '../context/ThemeContext'
import { withBase } from '../lib/paths'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const CORE_STACK = ['TypeScript', 'React', 'Laravel', 'Python']
const CORE_STACK_ICONS: FolderIcon[] = CORE_STACK.map((label) => {
  const accent = getBrandAccent(label, '#ff7515')
  return {
    label,
    background: `color-mix(in srgb, ${accent} 18%, var(--card))`,
    node: <BrandIcon label={label} size={36} />,
  }
})

function ImageHolder({
  image,
  title,
}: {
  image: string
  title: string
}) {
  return (
    <div
      className="relative aspect-[1.36/1] overflow-hidden rounded-[1.5rem] border sm:aspect-[1.52/1] sm:rounded-[2rem]"
      style={{
        background: 'var(--project-image-bg)',
        borderColor: 'var(--project-image-border)',
        boxShadow: 'inset 0 0 0 1px var(--project-image-inset)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          background: 'var(--project-image-overlay)',
        }}
      />
      <img
        src={image}
        alt={`${title} preview`}
        className="project-image-parallax absolute inset-[-32%_0] h-[164%] w-full object-cover object-top"
      />
    </div>
  )
}

function ProjectModal({
  item,
  onClose,
}: {
  item: Project | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!item) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <motion.button
            type="button"
            aria-label="Close project details"
            className="absolute inset-0"
            style={{
              background: 'rgba(0,0,0,0.68)',
              backdropFilter: 'blur(14px)',
            }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[1.5rem] border sm:rounded-[2rem]"
            style={{
              background: 'var(--card)',
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow:
                '0 24px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.34, ease: EASE }}
          >
            <div className="relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
              <div
                className="min-h-[16rem] border-b p-4 lg:min-h-[22rem] lg:border-b-0 lg:border-r"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div className="h-full overflow-hidden rounded-[1.45rem] border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <img src={item.image} alt={`${item.title} preview`} className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-mono text-[10px]" style={{ color: 'var(--ink-4)' }}>
                        {item.index}
                      </span>
                      <span className="h-px w-8" style={{ background: 'var(--border)' }} />
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: item.accent }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <h3
                      className="text-3xl font-semibold leading-none tracking-normal sm:text-4xl lg:text-5xl"
                      style={{ color: 'var(--ink)', fontFamily: '"Archivo Black", "Space Grotesk", sans-serif' }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink-3)', background: 'var(--surface)' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="max-w-[58ch] text-sm leading-relaxed sm:text-base lg:text-lg" style={{ color: 'var(--ink-2)' }}>
                  {item.description}
                </p>

                <motion.div
                  className="mt-8 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28, ease: EASE, delay: 0.08 }}
                >
                  {item.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="grid grid-cols-[2rem_1fr] gap-3 rounded-[1.1rem] border px-4 py-4"
                      style={{ background: 'var(--surface)', borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <span className="font-mono text-xs" style={{ color: item.accent }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                        {highlight}
                      </p>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  className="mt-7 flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28, ease: EASE, delay: 0.12 }}
                >
                  {item.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]"
                      style={{ color: 'var(--ink-3)', borderColor: 'var(--border)', background: 'var(--surface)' }}
                    >
                      {chip}
                    </span>
                  ))}
                </motion.div>

                {item.href ? (
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.28, ease: EASE, delay: 0.16 }}
                  >
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border px-5 py-3 font-mono text-xs uppercase tracking-[0.14em]"
                      style={{ color: '#050505', borderColor: item.accent, background: item.accent }}
                    >
                      Visit Project <ArrowUpRight size={13} />
                    </a>
                  </motion.div>
                ) : null}
              </div>
            </div>
            <div
              className="relative border-t px-6 py-4 sm:px-8"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-4)' }}>
                  Featured case note
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--ink-3)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function ProjectCard({
  item,
  onReadMore,
}: {
  item: Project
  onReadMore: (project: Project) => void
}) {
  return (
    <article className="group">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[11px]" style={{ color: 'var(--ink-4)' }}>
          {item.index}
        </span>
        <span className="h-px w-7" style={{ background: 'var(--border)' }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-3)' }}>
          {item.label}
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="max-w-none text-[2.15rem] font-semibold leading-[0.96] tracking-tight sm:max-w-[12ch] sm:text-[2.6rem]" style={{ color: 'var(--ink)' }}>
          {item.title}
        </h3>
        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors sm:inline-flex"
            style={{ borderColor: 'var(--border)', color: 'var(--ink-3)', background: 'var(--surface)' }}
          >
            Live Site <ArrowUpRight size={12} />
          </a>
        ) : null}
      </div>

      <div
        className="rounded-[1.8rem] border p-2.5 sm:rounded-[2.15rem] sm:p-4"
        style={{
          background: 'var(--project-frame)',
          borderColor: 'var(--project-frame-border)',
          boxShadow: 'var(--project-frame-shadow)',
        }}
      >
        <div
          className="flex min-h-0 flex-col rounded-[1.55rem] border px-4 pb-4 pt-4 sm:min-h-[31rem] sm:rounded-[1.85rem] sm:px-7 sm:pb-7 sm:pt-7"
          style={{
            background: 'var(--project-panel)',
            borderColor: 'var(--project-panel-border)',
          }}
        >
          <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <p
              className="max-w-none text-[0.98rem] font-medium leading-[1.6] sm:max-w-[24ch] sm:text-[1.12rem]"
              style={{ color: 'var(--project-copy)' }}
            >
              {item.description}
            </p>
            <button
              type="button"
              onClick={() => onReadMore(item)}
              className="inline-flex shrink-0 self-start items-center gap-1.5 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-white"
              style={{
                background: 'var(--project-action-bg)',
                borderColor: 'var(--project-action-border)',
                color: 'var(--project-action-ink)',
              }}
            >
              Read More
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="project-card-image mt-auto pt-1 sm:pt-0">
            <ImageHolder image={item.image} title={item.title} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-5">
        {item.chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: 'var(--ink-3)', borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            {chip}
          </span>
        ))}
      </div>
    </article>
  )
}

function BentoProjectPreview({ item, onReadMore }: { item: Project; onReadMore: (project: Project) => void }) {
  return (
    <button
      type="button"
      onClick={() => onReadMore(item)}
      className="featured-project__companion"
      aria-label={`Read about ${item.title}`}
    >
      <img src={item.image} alt="" />
      <span className="featured-project__companion-wash" aria-hidden="true" />
      <span className="featured-project__companion-index">{item.index}</span>
      <span className="featured-project__companion-copy">
        <small>{item.label}</small>
        <strong>{item.title}</strong>
      </span>
      <ArrowUpRight className="featured-project__companion-arrow" size={15} aria-hidden="true" />
    </button>
  )
}

function FeaturedProject({
  item,
  companionProjects,
  onReadMore,
}: {
  item: Project
  companionProjects: Project[]
  onReadMore: (project: Project) => void
}) {
  const articleRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ['start end', 'end start'],
  })
  const bentoY = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [56, 0, -56])
  const bentoScale = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [1, 1, 1] : [0.93, 1, 0.93])
  const { theme } = useTheme()

  return (
    <motion.div ref={articleRef} className="featured-project-scroll" style={{ y: bentoY, scale: bentoScale }}>
    <motion.article
      className="featured-project"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: EASE }}
    >
      <div className="featured-project__masthead">
        <div className="featured-project__title-block">
          <h3>Featured<br className="hidden sm:block" /> project<span className="featured-project__period">.</span></h3>
        </div>
        <span className="featured-project__edition">Selected work / 2026</span>
      </div>

      <div className="featured-project__grid">
        <div className="featured-project__profile">
          <div className="featured-project__profile-top">
            <span className="featured-project__number">{item.index}</span>
            <span className="featured-project__type">{item.label}</span>
          </div>
          <div>
            <p className="featured-project__kicker">{item.index === '04' ? 'API exploration + research' : item.index === '02' ? 'The starting point' : `A closer look at ${item.label}`}</p>
            <h4>{item.title}</h4>
            <p className="featured-project__description">{item.description}</p>
          </div>
          <div className="featured-project__profile-bottom">
            <div className="featured-project__actions">
              <button type="button" onClick={() => onReadMore(item)} className="featured-project__open">
                Read more <ArrowUpRight size={15} />
              </button>
              {item.href && <a href={item.href} target="_blank" rel="noopener noreferrer" className="featured-project__live">Live site</a>}
            </div>
            <span className="featured-project__stamp" aria-hidden="true">{item.index}<br />PROJECT</span>
          </div>
        </div>

        <div className="featured-project__visual-column">
          <div className="featured-project__visual-bento">
            <div
              className="featured-project__visual"
              onPointerMove={(event) => {
                if (reduceMotion || event.pointerType !== 'mouse') return
                const rect = event.currentTarget.getBoundingClientRect()
                const x = (event.clientX - rect.left) / rect.width - 0.5
                const y = (event.clientY - rect.top) / rect.height - 0.5
                event.currentTarget.style.setProperty('--feature-tilt-x', `${-y * 4}deg`)
                event.currentTarget.style.setProperty('--feature-tilt-y', `${x * 5}deg`)
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty('--feature-tilt-x', '0deg')
                event.currentTarget.style.setProperty('--feature-tilt-y', '0deg')
              }}
            >
              <img
                src={item.image}
                alt={`${item.title} interface preview`}
                className="featured-project__image"
              />
              <div className="featured-project__image-wash" aria-hidden="true" />
              <span className="featured-project__image-label">{item.label} / {item.index}</span>
              <button type="button" onClick={() => onReadMore(item)} className="featured-project__image-action" aria-label={`Read about ${item.title}`}>
                <ArrowUpRight size={19} />
              </button>
            </div>
            <div className="featured-project__companion-stack">
              {companionProjects.map((project) => (
                <BentoProjectPreview key={project.index} item={project} onReadMore={onReadMore} />
              ))}
            </div>
          </div>
          <div className="featured-project__mini-grid">
            <div className="featured-project__mini featured-project__mini--stack">
              <IconFolder
                compact
                theme={theme}
                title="Core stack"
                tags={CORE_STACK}
                icons={CORE_STACK_ICONS}
                spread={44}
                showPill={false}
              />
            </div>
            <a href={withBase('/projects')} className="featured-project__mini featured-project__mini--archive">
              <span>Project archive</span>
              <strong>View all projects</strong>
              <ArrowUpRight className="absolute right-3 top-3 text-accent" size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
    </motion.div>
  )
}

function AllProjectsBento() {
  const previews = allProjects.filter((project) => project.index !== '07')

  return (
    <a
      href={withBase('/projects')}
      className="projects-archive-bento"
      aria-label={`Explore all ${allProjects.length} projects`}
    >
      <div className="projects-archive-bento__copy">
        <h3>Every build,<br />part of the story<span>.</span></h3>
      </div>
      <div className="projects-archive-bento__gallery" aria-hidden="true">
        <div className="projects-archive-bento__track">
          {[0, 1].map((copy) => (
            <div className="projects-archive-bento__run" key={copy}>
              {previews.map((project) => (
                <div className="projects-archive-bento__tile" key={`${copy}-${project.index}`}>
                  <img src={project.image} alt="" loading="lazy" />
                  <span>{project.index} / {project.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="projects-archive-bento__footer">
        <span className="projects-archive-bento__cta">Explore all {allProjects.length} projects <ArrowUpRight size={16} /></span>
      </div>
    </a>
  )
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const featured = allProjects.find((project) => project.index === '05')
  const companionProjects = allProjects.filter((project) => ['01', '03', '04'].includes(project.index))
  const remainingProjects = projects.filter((project) => !['01', '02', '03', '04'].includes(project.index))

  return (
    <>
      <Section id="projects" className="mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-28">
        <div className="projects-heading">
          <div>
            <AnimatedText text={'Made to work\nin the real world.'} />
            <p>A few systems, experiments, and interfaces I’ve shaped from idea to working build.</p>
          </div>
        </div>

        {featured && <FeaturedProject item={featured} companionProjects={companionProjects} onReadMore={setSelectedProject} />}

        <div className="grid grid-cols-1 gap-x-10 gap-y-16 pt-16 lg:grid-cols-2 lg:pt-24">
          {remainingProjects.map((item) => (
            <ProjectCard key={item.index} item={item} onReadMore={setSelectedProject} />
          ))}
        </div>

        <div className="pt-16 sm:pt-20">
          <AllProjectsBento />
        </div>
      </Section>

      <ProjectModal item={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}
