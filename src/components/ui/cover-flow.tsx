import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export type CoverFlowItem = {
  id: string
  image: string
  title: string
}

/** Project-adapted cover flow inspired by Louis Studios' MIT component. */
export function CoverFlow({ items, autoplay = true }: { items: CoverFlowItem[]; autoplay?: boolean }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const reducedMotion = useReducedMotion()
  const dragStart = useRef<number | null>(null)
  const dragged = useRef(false)
  const lastWheel = useRef(0)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const onChange = (event: MediaQueryListEvent) => setMobile(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!autoplay || paused || reducedMotion || items.length < 2) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % items.length), 3800)
    return () => window.clearInterval(timer)
  }, [autoplay, paused, reducedMotion, items.length])

  const step = (direction: number) => {
    setActive((index) => (index + direction + items.length) % items.length)
  }

  if (items.length === 0) return null

  return (
    <div
      className="cover-flow"
      role="region"
      aria-label="Project preview cover flow"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1) }
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1) }
        if (event.key === 'Home') { event.preventDefault(); setActive(0) }
        if (event.key === 'End') { event.preventDefault(); setActive(items.length - 1) }
      }}
      onWheel={(event) => {
        const now = performance.now()
        if (Math.abs(event.deltaY) < 8 || now - lastWheel.current < 480) return
        lastWheel.current = now
        step(event.deltaY > 0 ? 1 : -1)
      }}
      onPointerDown={(event) => { dragStart.current = event.clientX }}
      onPointerUp={(event) => {
        if (dragStart.current === null) return
        const distance = event.clientX - dragStart.current
        dragStart.current = null
        if (Math.abs(distance) < 38) return
        dragged.current = true
        step(distance < 0 ? 1 : -1)
        window.setTimeout(() => { dragged.current = false }, 0)
      }}
      onPointerCancel={() => { dragStart.current = null }}
    >
      <div className="cover-flow__stage">
        {items.map((item, index) => {
          const half = Math.floor(items.length / 2)
          const offset = ((index - active + items.length + half) % items.length) - half
          const distance = Math.abs(offset)
          const visible = distance <= 3
          return (
            <motion.button
              key={item.id}
              type="button"
              className="cover-flow__card"
              aria-label={`Show ${item.title} preview`}
              aria-current={offset === 0 ? 'true' : undefined}
              tabIndex={visible ? 0 : -1}
              style={{ zIndex: items.length - distance, pointerEvents: visible ? 'auto' : 'none' }}
              animate={{
                x: offset * (mobile ? 126 : 205),
                rotateY: offset === 0 ? 0 : offset < 0 ? 57 : -57,
                scale: offset === 0 ? 1 : Math.max(0.7, 0.91 - distance * 0.07),
                opacity: visible ? 1 : 0,
              }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 }}
              onClick={() => { if (!dragged.current) setActive(index) }}
            >
              <span className="cover-flow__art">
                <img src={item.image} alt="" draggable={false} loading={distance <= 2 ? 'eager' : 'lazy'} />
                <span className="cover-flow__caption"><strong>{item.title}</strong></span>
              </span>
              <span className="cover-flow__reflection" aria-hidden="true"><img src={item.image} alt="" draggable={false} /></span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
