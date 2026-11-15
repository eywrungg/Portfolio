import { useEffect, useRef } from 'react'

/** A lightweight, theme-aware take on Aceternity's hoverable Background Boxes. */
export function Boxes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const cell = 58
    const skewX = -0.34
    const skewY = 0.12
    let width = 0
    let height = 0
    let pixelRatio = 1
    let pointerX = -1000
    let pointerY = -1000
    let lastMove = -1000
    let frame = 0
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = (time: number) => {
      frame = 0
      const light = document.documentElement.classList.contains('light')
      const line = light ? 'rgba(78, 65, 52, 0.12)' : 'rgba(240, 240, 240, 0.10)'
      const fill = light ? 'rgba(249, 115, 22, 0.22)' : 'rgba(249, 115, 22, 0.18)'
      const age = time - lastMove
      const strength = reducedMotion ? 0 : Math.max(0, 1 - age / 900)
      const originY = -130
      const margin = Math.ceil((width + height) / cell)

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.setTransform(pixelRatio, pixelRatio * skewY, pixelRatio * skewX, pixelRatio, 0, pixelRatio * originY)
      context.beginPath()
      for (let x = -margin * cell; x <= margin * cell; x += cell) {
        context.moveTo(x, -margin * cell)
        context.lineTo(x, margin * cell)
      }
      for (let y = -margin * cell; y <= margin * cell; y += cell) {
        context.moveTo(-margin * cell, y)
        context.lineTo(margin * cell, y)
      }
      context.strokeStyle = line
      context.lineWidth = 1
      context.stroke()

      if (strength > 0) {
        // Find the pointer's cell with the inverse of the canvas skew transform.
        const determinant = 1 - skewX * skewY
        const localX = (pointerX - skewX * (pointerY - originY)) / determinant
        const localY = ((pointerY - originY) - skewY * pointerX) / determinant
        const column = Math.floor(localX / cell)
        const row = Math.floor(localY / cell)

        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const distance = Math.hypot(dx, dy)
            const opacity = strength * Math.max(0, 1 - distance / 3)
            if (opacity <= 0) continue
            context.globalAlpha = opacity
            context.fillStyle = fill
            context.fillRect((column + dx) * cell + 1, (row + dy) * cell + 1, cell - 2, cell - 2)
          }
        }
        context.globalAlpha = 1
      }

      if (strength > 0.01) frame = requestAnimationFrame(draw)
    }

    const redraw = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      redraw()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointerX = event.clientX
      pointerY = event.clientY
      lastMove = performance.now()
      redraw()
    }
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches
      redraw()
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const themeObserver = new MutationObserver(redraw)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    motionQuery.addEventListener('change', onMotionChange)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    resize()

    return () => {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return (
    <div className="background-boxes" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
