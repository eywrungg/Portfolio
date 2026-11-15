import { useEffect, useId, useRef, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { HeroParallax, type HeroParallaxProduct } from '../components/ui/hero-parallax'
import { achievements, type Achievement } from '../data/achievements'
import { withBase } from '../lib/paths'

type GalleryAchievement = HeroParallaxProduct & {
  achievement: Achievement
  certificateUrl?: string
  eyebrow: string
  description: string
  meta: string
  imageCaption: string
}

const milestoneVisuals: Record<string, { alt: string; caption: string }> = {
  'google-ai': {
    alt: 'Portfolio project preview',
    caption: 'Portfolio project preview · milestone visual',
  },
  'harmonics-club': {
    alt: 'Personal photograph',
    caption: 'Personal photo · community milestone visual',
  },
  'deans-lister': {
    alt: 'PyroWatch project preview',
    caption: 'PyroWatch project preview · academic milestone visual',
  },
  capstone: {
    alt: 'PyroWatch project preview',
    caption: 'PyroWatch project preview · leadership milestone visual',
  },
}

const galleryItems: GalleryAchievement[] = achievements.map((achievement) => {
  const certificateImage = achievement.certificateImage
    ? withBase(achievement.certificateImage)
    : undefined
  const visual = milestoneVisuals[achievement.id]

  return {
    id: achievement.id,
    title: achievement.title,
    eyebrow: achievement.eyebrow,
    description: achievement.summary,
    meta: achievement.meta,
    accent: achievement.accent,
    thumbnail: certificateImage ?? achievement.image,
    link: withBase(achievement.certificateUrl ?? '/achievements'),
    imageWidth: achievement.imageWidth,
    imageHeight: achievement.imageHeight,
    imageFit: certificateImage ? 'contain' : 'cover',
    imageAlt: certificateImage
      ? `Certificate for ${achievement.title}`
      : visual?.alt ?? `Milestone visual for ${achievement.title}`,
    imageCaption: certificateImage ? 'E-certificate' : visual?.caption ?? 'Milestone visual',
    certificateUrl: achievement.certificateUrl ? withBase(achievement.certificateUrl) : undefined,
    achievement,
  }
})

export default function Achievements() {
  const headingId = useId()
  const dialogId = useId()
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLAnchorElement | null>(null)
  const [selected, setSelected] = useState<GalleryAchievement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!selected || !dialog) return

    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [selected])

  return (
    <section id="achievements" aria-labelledby={headingId} className="relative mb-16 scroll-mt-8 sm:mb-20">
      <HeroParallax
        products={galleryItems}
        detailId={dialogId}
        onSelect={(item, trigger) => {
          triggerRef.current = trigger
          setSelected(item)
        }}
        header={
          <header className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:py-28 lg:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2">
              Learning, leadership & community
            </p>
            <h2 id={headingId} className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-6xl lg:text-7xl">
              Achievements <br />& milestones
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2 md:text-lg">
              Progress in the classroom, through projects, and with my community.
              Explore the moments behind the work.
            </p>
          </header>
        }
      />

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => setSelected(null)}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-[1.5rem] border border-border bg-card p-0 text-ink shadow-card backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {selected && (
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">
                  {selected.eyebrow}
                </p>
                <h3 id={titleId} className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {selected.title}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close achievement details"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <p id={descriptionId} className="mt-5 text-sm leading-relaxed text-ink-2 sm:text-base">
              {selected.description}
            </p>
            <p className="mt-3 text-xs font-medium text-ink-2">{selected.meta}</p>

            <figure className="mt-6">
              <img
                src={selected.thumbnail}
                alt={selected.imageAlt}
                decoding="async"
                width={selected.imageWidth ?? 1000}
                height={selected.imageHeight ?? 700}
                className="h-auto w-full rounded-xl border border-border bg-surface object-contain"
              />
              <figcaption className="mt-3 text-xs leading-relaxed text-ink-2">
                {selected.imageCaption}
              </figcaption>
            </figure>

            {selected.certificateUrl && (
              <a
                href={selected.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                Open e-certificate <span className="sr-only">(opens in a new tab)</span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </dialog>
    </section>
  )
}
