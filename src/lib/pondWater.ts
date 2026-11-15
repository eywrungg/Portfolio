import type { Swimmer } from './fishSwimming'

type Wake = { x: number; y: number; age: number; heading: number; strength: number }
type Ripple = { x: number; y: number; born: number; strength: number }

/** A bounded wake buffer shares the fish clock, so water also pauses offscreen. */
export class PondWater {
  private wakes: Wake[][] = [[], [], []]
  private emitted = [0, 0, 0]
  private ripples: Ripple[] = []
  private lastPaint = -1

  splash(x: number, y: number, now: number, strength = 1) {
    this.ripples.push({ x, y, born: now, strength })
    if (this.ripples.length > 18) this.ripples.shift()
  }

  paint(canvas: HTMLCanvasElement, fish: Swimmer[], now: number, width: number, height: number, dark: boolean) {
    if (now - this.lastPaint < 1 / 30) return
    this.lastPaint = now
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    const tint = dark ? '143, 211, 211' : '63, 125, 133'

    fish.forEach((swimmer, index) => {
      const trail = this.wakes[index]
      if (swimmer.speed > 12 && now - this.emitted[index] > 0.09) {
        const tail = swimmer.mouthReach * 1.1
        trail.push({
          x: swimmer.x - Math.cos(swimmer.heading) * tail,
          y: swimmer.y - Math.sin(swimmer.heading) * tail,
          heading: swimmer.heading, age: now,
          strength: Math.min(1, swimmer.speed / 160) * (0.5 + swimmer.effort * 0.5),
        })
        this.emitted[index] = now
        if (trail.length > 32) trail.shift()
      }
      while (trail.length && now - trail[0].age > 2.4) trail.shift()

      // A faint flat highlight and trailing arcs suggest the water surface.
      ctx.beginPath()
      ctx.ellipse(swimmer.x, swimmer.y, 55, 31, swimmer.heading, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${tint},${dark ? 0.025 : 0.02})`
      ctx.fill()
      trail.forEach((wake, step) => {
        const age = now - wake.age
        const alpha = (1 - age / 2.4) * (0.12 + wake.strength * 0.16)
        const spread = 7 + age * (13 + wake.strength * 9)
        const next = trail[step + 1]
        if (next) {
          const nextSpread = 7 + (now - next.age) * (13 + next.strength * 9)
          for (const side of [-1, 1]) {
            ctx.beginPath()
            ctx.moveTo(wake.x - Math.sin(wake.heading) * spread * side, wake.y + Math.cos(wake.heading) * spread * side)
            ctx.lineTo(next.x - Math.sin(next.heading) * nextSpread * side, next.y + Math.cos(next.heading) * nextSpread * side)
            ctx.strokeStyle = `rgba(${tint},${alpha * 0.65})`
            ctx.lineWidth = 1.2
            ctx.stroke()
          }
        }
        if (step % 5 !== 0) return
        ctx.save()
        ctx.translate(wake.x, wake.y)
        ctx.rotate(wake.heading)
        ctx.strokeStyle = `rgba(${tint},${alpha * 0.4})`
        ctx.lineWidth = 0.85
        ctx.beginPath()
        ctx.ellipse(-age * 7, 0, spread * 0.65, spread, 0, -Math.PI * 0.57, Math.PI * 0.57)
        ctx.stroke()
        if (step % 4 === 0 && wake.strength > 0.45) {
          ctx.beginPath()
          ctx.arc(-age * 10, Math.sin(step * 2.3) * spread * 0.6, 1 + age * 1.5, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${tint},${alpha * 0.65})`
          ctx.stroke()
        }
        ctx.restore()
      })
    })
    this.ripples = this.ripples.filter((ripple) => now - ripple.born < 2.2)
    this.ripples.forEach((ripple) => {
      const age = now - ripple.born
      for (let ring = 0; ring < 3; ring++) {
        const life = age - ring * 0.16
        if (life <= 0) continue
        ctx.beginPath()
        ctx.ellipse(ripple.x, ripple.y, 5 + life * 65, 4 + life * 45, -0.15, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${tint},${Math.max(0, 1 - life / 2.2) * 0.32 * ripple.strength})`
        ctx.lineWidth = 1.1
        ctx.stroke()
      }
    })
  }
}
