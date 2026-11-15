import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Grid2X2, Home, Layers3, Wrench, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import SwitchButton from './kokonutui/switch-button'
import Button from './Button'
import ContactSheet from './ContactSheet'
import BottomNavBar from './ui/bottom-nav-bar'
import { currentPathname, withBase } from '../lib/paths'

const NAV_LINKS = [
  { label: 'Home', short: 'Home', href: '#about', icon: Home },
  { label: 'Projects', short: 'Work', href: '#projects', icon: Layers3 },
  { label: 'Skills', short: 'Skills', href: '#skills', icon: Wrench },
  { label: 'Other', short: 'Explore', href: '#other', icon: Grid2X2 },
  { label: 'Contact', short: 'Contact', href: '#contact', icon: ArrowUpRight },
]

const SECTION_IDS = ['about', 'projects', 'skills', 'other', 'contact']
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function Nav() {
  const { theme, toggle } = useTheme()
  const pathname = currentPathname()
  const isProjectsPage = pathname === '/projects'
  const isOtherPage = pathname === '/achievements' || pathname === '/guestbook' || pathname === '/blog'
  const [active, setActive] = useState(isProjectsPage ? 'projects' : isOtherPage ? 'other' : 'about')
  const [contactSheetOpen, setContactSheetOpen] = useState(false)
  const [railExpanded, setRailExpanded] = useState(false)
  const reduceMotion = useReducedMotion()
  const scrollAnimation = useRef<{ stop: () => void } | null>(null)

  const scrollToPosition = (top: number) => {
    scrollAnimation.current?.stop()
    if (reduceMotion) {
      window.scrollTo({ top, behavior: 'auto' })
      return
    }

    scrollAnimation.current = animate(window.scrollY, top, {
      duration: 1.05,
      ease: EASE,
      onUpdate: (value) => window.scrollTo({ top: value, behavior: 'instant' as ScrollBehavior }),
    })
  }

  const scrollToTop = () => scrollToPosition(0)

  useEffect(() => {
    if (isProjectsPage) {
      setActive('projects')
      return
    }
    if (isOtherPage) {
      setActive('other')
      return
    }

    const updateActive = () => {
      const marker = window.innerHeight * 0.32
      let current = 'about'
      for (const id of SECTION_IDS) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= marker) current = id
      }
      setActive(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    window.addEventListener('hashchange', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
      window.removeEventListener('hashchange', updateActive)
    }
  }, [isOtherPage, isProjectsPage])

  const handleLink = (href: string) => {
    setRailExpanded(false)
    const section = href.slice(1)

    if (isProjectsPage || isOtherPage) {
      if (section === 'projects' && isProjectsPage) {
        setActive('projects')
        scrollToTop()
      } else if (section === 'other' && isOtherPage) {
        setActive('other')
        scrollToTop()
      } else if (section === 'projects') {
        window.location.href = withBase('/#projects')
      } else if (section === 'other') {
        window.location.href = withBase('/#other')
      } else {
        window.location.href = withBase(`/${href}`)
      }
      return
    }

    setActive(section)
    const target = document.querySelector<HTMLElement>(href)
    if (target) scrollToPosition(target.getBoundingClientRect().top + window.scrollY - 24)
  }

  const railCompact = !railExpanded

  return (
    <>
      <motion.nav
        className={`folio-rail ${railCompact ? 'is-compact' : ''}`}
        aria-label="Portfolio sections"
        animate={{ width: 56, height: railCompact ? 56 : 360, borderRadius: 28 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {railCompact ? (
            <motion.button
              key="compact"
              type="button"
              className="folio-rail__orb"
              onClick={() => setRailExpanded(true)}
              aria-label="Open navigation"
              aria-expanded={false}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.75 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              <Layers3 size={20} aria-hidden="true" />
              <span className="folio-rail__orb-pulse" aria-hidden="true" />
            </motion.button>
          ) : (
            <motion.div key="expanded" className="folio-rail__content" initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
              <div className="folio-rail__head">
                <button type="button" onClick={() => setRailExpanded(false)} aria-label="Collapse navigation">
                  <X size={19} aria-hidden="true" />
                </button>
              </div>
              <ul className="folio-rail__links">
                {NAV_LINKS.map((link, index) => {
                  const Icon = link.icon
                  const isActive = active === link.href.slice(1)
                  return (
                    <motion.li key={link.href} initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.72 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.72 }} transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : index * 0.035 }}>
                      <button type="button" onClick={() => handleLink(link.href)} aria-label={`Go to ${link.label}`} aria-current={isActive ? 'location' : undefined} className={`folio-rail__link ${isActive ? 'is-active' : ''}`}>
                        {isActive && <motion.span layoutId="folio-rail-active" className="folio-rail__active" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 390, damping: 36 }} />}
                        <Icon size={20} aria-hidden="true" />
                      </button>
                    </motion.li>
                  )
                })}
              </ul>
              <div className="folio-rail__foot">
                <SwitchButton className="folio-rail__theme" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} theme={theme} onThemeChange={(nextTheme) => { if (nextTheme !== theme) toggle() }} showLabel={false} size="sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <div className="folio-contact">
        <span className="folio-contact__note">Have a good one in mind?</span>
        <Button onClick={() => setContactSheetOpen(true)} variant="outline" className="folio-contact__button">
          <span>Let’s talk</span><ArrowUpRight size={14} />
        </Button>
      </div>

      <div className="folio-mobile-head">
        <SwitchButton
          className="folio-index__theme"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          theme={theme}
          onThemeChange={(nextTheme) => { if (nextTheme !== theme) toggle() }}
          showLabel={false}
          size="sm"
        />
      </div>

      <BottomNavBar items={NAV_LINKS} activeHref={`#${active}`} onNavigate={handleLink} onContact={() => setContactSheetOpen(true)} reducedMotion={!!reduceMotion} />

      <ContactSheet open={contactSheetOpen} onClose={() => setContactSheetOpen(false)} />
    </>
  )
}
