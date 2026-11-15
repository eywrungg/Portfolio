// Adapted from Manu Arora's Hero Parallax supplied via 21st.dev.
// https://ui.aceternity.com/components/hero-parallax
import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export type HeroParallaxProduct = {
  id: string
  title: string
  link: string
  thumbnail: string
  imageAlt: string
  imageFit?: 'cover' | 'contain'
  imageWidth?: number
  imageHeight?: number
}

type HeroParallaxProps<T extends HeroParallaxProduct> = {
  products: readonly T[]
  header: ReactNode
  detailId?: string
  onSelect?: (product: T, trigger: HTMLAnchorElement) => void
  className?: string
}

const motionQuery = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
const springConfig = { stiffness: 300, damping: 30, bounce: 100 }

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia(motionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export function HeroParallax<T extends HeroParallaxProduct>({ products, header, detailId, onSelect, className }: HeroParallaxProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const animated = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false)
  const [width, setWidth] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // The supplied demo has fifteen products. Balance the real entries over its
  // three rows, without repeating certificates or introducing demo products.
  const firstCount = Math.ceil(products.length / 3)
  const secondCount = Math.ceil((products.length - firstCount) / 2)
  const firstRow = products.slice(0, firstCount)
  const secondRow = products.slice(firstCount, firstCount + secondCount)
  const thirdRow = products.slice(firstCount + secondCount)
  const rows = [firstRow, secondRow, thirdRow].filter(row => row.length)

  // Scale the demo's 1000px travel to the shorter rows in this portfolio.
  const travel = Math.min(1000, width * Math.max(0.12, firstCount * 0.06))
  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, travel]), springConfig)
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -travel]), springConfig)
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig)
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig)
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springConfig)
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), springConfig)

  return (
    <div
      ref={ref}
      data-hero-parallax={animated ? 'animated' : 'static'}
      className={cn('relative flex flex-col overflow-hidden antialiased [perspective:1000px] [transform-style:preserve-3d]',
        animated ? 'h-[300vh] min-h-[170rem] py-40' : 'px-5 py-16 sm:px-6', className)}
    >
      {header}
      <motion.div
        className="hero-parallax-scene"
        style={animated ? { rotateX, rotateZ, y: translateY, opacity } : { rotateX: 0, rotateZ: 0, y: 0, opacity: 1 }}
      >
        {rows.map((row, index) => (
          <ul
            key={index}
            className={cn('m-0 list-none p-0', animated
              ? `mb-20 flex items-center justify-center gap-8 last:mb-0 lg:gap-14 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`
              : 'mx-auto mb-5 grid max-w-6xl grid-cols-1 items-start gap-5 last:mb-0 sm:grid-cols-2')}
          >
            {row.map(product => (
              <ProductCard key={product.id} product={product} translate={index % 2 === 0 ? translateX : translateXReverse}
                animated={animated} detailId={detailId} onSelect={onSelect} />
            ))}
          </ul>
        ))}
      </motion.div>
    </div>
  )
}

export function ProductCard<T extends HeroParallaxProduct>({ product, translate, animated, detailId, onSelect }: {
  product: T
  translate: MotionValue<number>
  animated: boolean
  detailId?: string
  onSelect?: (product: T, trigger: HTMLAnchorElement) => void
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    onSelect(product, event.currentTarget)
  }

  return (
    <motion.li
      style={{ x: animated ? translate : 0 }}
      whileHover={animated ? { y: -20 } : undefined}
      className={cn('group/product relative flex-shrink-0', animated ? 'w-[min(30rem,32vw)]' : 'w-full')}
    >
      <a
        href={product.link}
        onClick={handleClick}
        aria-label={`View details: ${product.title}`}
        aria-haspopup={onSelect ? 'dialog' : undefined}
        aria-controls={onSelect ? detailId : undefined}
        className="relative block overflow-hidden rounded-xl border border-border bg-card shadow-card outline-none group-hover/product:shadow-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
        style={{ aspectRatio: product.imageWidth && product.imageHeight ? `${product.imageWidth} / ${product.imageHeight}` : '5 / 4' }}
      >
        <img src={product.thumbnail} alt={product.imageAlt} width={product.imageWidth} height={product.imageHeight}
          loading="lazy" decoding="async"
          className={cn('absolute inset-0 h-full w-full', product.imageFit === 'contain' ? 'object-contain' : 'object-cover object-left-top')} />
        <span aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-black/75 transition-opacity duration-300',
          animated ? 'opacity-0 group-hover/product:opacity-100 group-focus-within/product:opacity-100' : 'opacity-100')} />
        <span className={cn('absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white transition-opacity duration-300',
          animated ? 'opacity-0 group-hover/product:opacity-100 group-focus-within/product:opacity-100' : 'opacity-100')}>
          <span className="text-base font-semibold leading-snug">{product.title}</span>
          <ArrowUpRight aria-hidden="true" size={20} className="shrink-0" />
        </span>
      </a>
    </motion.li>
  )
}
