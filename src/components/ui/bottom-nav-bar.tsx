import { AnimatePresence, motion } from 'motion/react'
import { Calendar, type LucideIcon } from 'lucide-react'

type BottomNavItem = {
  label: string
  short: string
  href: string
  icon: LucideIcon
}

type BottomNavBarProps = {
  items: readonly BottomNavItem[]
  activeHref: string
  onNavigate: (href: string) => void
  onContact: () => void
  reducedMotion: boolean
}

// Active tab expands into a labeled pill; the other chapters remain icon buttons.
export default function BottomNavBar({ items, activeHref, onNavigate, onContact, reducedMotion }: BottomNavBarProps) {
  const spring = reducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 34 }

  return (
    <nav className="portfolio-bottom-nav" aria-label="Mobile portfolio navigation">
      <div className="portfolio-bottom-nav__items">
        {items.map(item => {
          const Icon = item.icon
          const isActive = item.href === activeHref
          return (
            <motion.button
              key={item.href}
              type="button"
              layout={!reducedMotion}
              transition={spring}
              className={`portfolio-bottom-nav__item ${isActive ? 'is-active' : ''}`}
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={() => onNavigate(item.href)}
            >
              {isActive && <motion.span layoutId="mobile-nav-pill" className="portfolio-bottom-nav__pill" transition={spring} />}
              <span className="portfolio-bottom-nav__content">
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                <AnimatePresence initial={false} mode="popLayout">
                  {isActive && (
                    <motion.span key={item.href} className="portfolio-bottom-nav__label"
                      initial={reducedMotion ? false : { opacity: 0, width: 0, x: -7 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, width: 0, x: -7 }}
                      transition={spring}
                    >{item.short}</motion.span>
                  )}
                </AnimatePresence>
              </span>
            </motion.button>
          )
        })}
      </div>
      <span className="portfolio-bottom-nav__divider" aria-hidden="true" />
      <button type="button" className="portfolio-bottom-nav__contact" onClick={onContact} aria-label="Open contact form">
        <Calendar size={19} aria-hidden="true" />
      </button>
    </nav>
  )
}
