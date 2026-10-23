import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, CheckCircle2, Download, Smartphone, X } from 'lucide-react'
import { allProjects, type Project } from '../data/projects'
import { withBase } from '../lib/paths'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const projectGroups = [
  {
    title: 'Development Projects',
    description: 'Web apps, APIs, games, and portfolio builds.',
  },
  {
    title: 'App & AR Projects',
    description: 'Mobile APK work and AR-focused builds.',
  },
  {
    title: 'Creative Works',
    description: 'UI design practice, Photoshop posters, photography, and visual editing work.',
  },
] as const

function AppDownloadModal({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  const canShow = Boolean(project?.download && project.arcore)
  const isExternalDownload = Boolean(project?.download && /^https?:\/\//.test(project.download.href))

  useEffect(() => {
    if (!canShow) return

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
  }, [canShow, onClose])

  return (
    <AnimatePresence>
      {canShow && project?.download && project.arcore ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-3 py-5 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          <button
            type="button"
            aria-label="Close Gabay download dialog"
            className="absolute inset-0 cursor-default"
            style={{ background: 'rgba(1, 10, 15, 0.78)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gabay-download-title"
            className="relative z-10 max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-[1.65rem] border sm:rounded-[2rem]"
            style={{
              background: 'linear-gradient(145deg, color-mix(in srgb, var(--card) 92%, #0a617d 8%), var(--card))',
              borderColor: 'color-mix(in srgb, #7dd3fc 45%, var(--border))',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[0.78fr_1.22fr]">
              <div
                className="relative min-h-[14rem] overflow-hidden border-b p-6 lg:min-h-full lg:border-b-0 lg:border-r lg:p-8"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(circle at 52% 22%, rgba(125,211,252,0.38), transparent 48%)' }}
                />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em]" style={{ borderColor: 'rgba(125,211,252,0.4)', color: '#b8f2ff', background: 'rgba(7,90,120,0.35)' }}>
                    <Smartphone size={13} /> Android AR app
                  </div>
                  <div className="mt-10 lg:mt-0">
                    <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: '#91ddec' }}>Gabay</p>
                    <p className="mt-3 max-w-[19rem] text-2xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
                      Check compatibility, then start your AR journey.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: project.accent }}>APK download</p>
                    <h2 id="gabay-download-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: 'var(--ink)' }}>
                      Is your phone ready for Gabay?
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink-3)', background: 'var(--surface)' }}
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--ink-3)' }}>Before you download</h3>
                    <ul className="mt-3 space-y-3">
                      {project.arcore.requirements.map((requirement) => (
                        <li key={requirement} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                          <CheckCircle2 className="mt-0.5 shrink-0" size={15} style={{ color: project.accent }} />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--ink-3)' }}>Examples of supported devices</h3>
                    <ul className="mt-3 space-y-3">
                      {project.arcore.sampleDevices.map((device) => (
                        <li key={device} className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                          {device}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={project.download.href}
                    {...(!isExternalDownload ? { download: project.download.fileName } : {})}
                    target={isExternalDownload ? '_blank' : undefined}
                    rel={isExternalDownload ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                    style={{ color: '#04141e', background: project.accent, boxShadow: '0 10px 28px color-mix(in srgb, #7dd3fc 24%, transparent)' }}
                  >
                    <Download size={17} />
                    {project.download.label}
                  </a>
                  <a
                    href={project.arcore.officialDevicesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    See Google’s full device list <ArrowUpRight size={14} />
                  </a>
                </div>

                <p className="mt-5 text-xs leading-relaxed" style={{ color: 'var(--ink-4)' }}>
                  Device support is determined by Google’s ARCore certification. Check the official list above if your exact model is not shown.
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default function ProjectsArchive() {
  const [downloadProject, setDownloadProject] = useState<Project | null>(null)

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-28">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <a
          href={withBase('/#projects')}
          className="inline-flex items-center gap-2 font-medium"
          style={{ color: 'var(--ink-2)' }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </a>
        <h1 className="text-4xl font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
          All Projects
        </h1>
      </div>

      <div className="space-y-14">
        {projectGroups.map((group) => {
          const items = allProjects.filter((project) => (project.category ?? 'Development Projects') === group.title)
          if (items.length === 0) return null

          return (
            <section key={group.title}>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--ink)' }}>
                  {group.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
                  {group.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((project) => {
                  const gallery = project.gallery ?? [project.image]
                  const isPortrait = project.orientation === 'portrait'
                  return (
                    <article
                      key={project.index}
                      className="rounded-[1.6rem] border p-4 transition-colors sm:p-5"
                      style={{
                        background: 'var(--card)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--card-shadow)',
                      }}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--ink-4)' }}>
                          {project.index}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-3)' }}>
                          {project.label}
                        </span>
                      </div>

                      {gallery.length > 1 ? (
                        <div
                          className={`mb-5 grid gap-2 ${
                            isPortrait ? 'grid-cols-2' : gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                          }`}
                        >
                          {gallery.map((image) => (
                            <div
                              key={image}
                              className={`${isPortrait ? 'aspect-[9/14]' : 'aspect-[4/3]'} overflow-hidden rounded-[1rem] border`}
                              style={{ background: '#080808', borderColor: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
                            >
                              <img src={image} alt={`${project.title} preview`} className="h-full w-full object-contain" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`mb-5 overflow-hidden rounded-[1.15rem] border ${
                            isPortrait ? 'mx-auto aspect-[9/14] max-h-[30rem] w-full max-w-[19rem]' : 'aspect-[1.75/1]'
                          }`}
                          style={{ borderColor: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
                        >
                          <img
                            src={project.image}
                            alt={`${project.title} preview`}
                            className={`h-full w-full ${isPortrait ? 'object-contain' : 'object-cover object-top'}`}
                          />
                        </div>
                      )}

                      <h2 className="text-xl font-semibold tracking-tight sm:text-[2rem]" style={{ color: 'var(--ink)' }}>
                        {project.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ color: 'var(--ink-2)' }}>
                        {project.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]"
                            style={{
                              color: 'var(--ink-3)',
                              borderColor: 'var(--border)',
                              background: 'var(--surface)',
                            }}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>

                      {project.download && project.arcore ? (
                        <button
                          type="button"
                          onClick={() => setDownloadProject(project)}
                          className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em]"
                          style={{ color: project.accent }}
                        >
                          Get Gabay APK <Download size={13} />
                        </button>
                      ) : project.href ? (
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em]"
                          style={{ color: 'var(--ink-3)' }}
                        >
                          Visit Project <ArrowUpRight size={12} />
                        </a>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <AppDownloadModal project={downloadProject} onClose={() => setDownloadProject(null)} />
    </main>
  )
}
