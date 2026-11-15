import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { createSwimmer, swimStep, type FishFood, type FishPointer, type PondBounds, type Swimmer } from '../lib/fishSwimming'
import type { KoiRect } from '../lib/koiPathfinding'
import { withBase } from '../lib/paths'
import { PondWater } from '../lib/pondWater'

type PondProps = { hostRef: RefObject<HTMLDivElement>; active: boolean }
type PondLayout = PondBounds & { obstacles: KoiRect[]; foods: FishFood[]; foodElements: HTMLElement[] }
type IconSpring = { x: number; y: number; vx: number; vy: number; element: HTMLElement }
const FISH = [
  { length: 122, patch: '#e54734', pale: '#fff4e7' },
  { length: 96, patch: '#e6a338', pale: '#fff0cd' },
  { length: 79, patch: '#c74932', pale: '#e6f0f1' },
]

const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeMotionPreference(onChange: () => void) {
  const media = window.matchMedia(motionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function FishSchool({ hostRef, active, waterRef }: PondProps & { waterRef: RefObject<HTMLCanvasElement> }) {
  const { scene, animations } = useLoader(GLTFLoader, withBase('/models/koi-base.glb'))
  const pointer = useRef<FishPointer | null>(null)
  const layout = useRef<PondLayout | null>(null)
  const measuredAt = useRef(-Infinity)
  const swimmers = useRef<Swimmer[]>([])
  const simulationTime = useRef(0)
  const offered = useRef<{ id: string; until: number } | null>(null)
  const previousPointer = useRef<{ x: number; y: number; time: number } | null>(null)
  const scare = useRef<FishPointer | null>(null)
  const scareSequence = useRef(0)
  const water = useRef(new PondWater())
  const iconSprings = useRef(new Map<string, IconSpring>())
  const previousActivities = useRef<string[]>([])
  const dark = useRef(false)

  // Each clone needs its own skeleton and mixer, so the tails never move in sync.
  const school = useMemo(() => FISH.map((config, index) => {
    const root = clone(scene)
    const ownedGeometries: THREE.BufferGeometry[] = []
    const ownedMaterials: THREE.Material[] = []
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      const materials = (Array.isArray(object.material) ? object.material : [object.material]).map((material) => {
        const copy = material.clone()
        if (copy instanceof THREE.MeshStandardMaterial && /pale/.test(copy.name)) copy.color.set(config.pale)
        ownedMaterials.push(copy)
        return copy
      })
      object.material = Array.isArray(object.material) ? materials : materials[0]
      if (index > 0 && object.geometry.getAttribute('color')) {
        object.geometry = object.geometry.clone()
        ownedGeometries.push(object.geometry)
        const colors = object.geometry.getAttribute('color')
        const patch = new THREE.Color(config.patch)
        for (let vertex = 0; vertex < colors.count; vertex++) {
          if (colors.getX(vertex) > colors.getY(vertex) * 1.5 && colors.getX(vertex) > 0.12) {
            colors.setXYZ(vertex, patch.r, patch.g, patch.b)
          }
        }
      }
    })
    root.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(root)
    const modelLength = Math.max(box.getSize(new THREE.Vector3()).z, 0.1)
    root.position.sub(box.getCenter(new THREE.Vector3()))
    const dorsal = new THREE.Group()
    dorsal.rotation.x = Math.PI / 2
    dorsal.add(root)
    const model = new THREE.Group()
    model.visible = false
    model.add(dorsal)
    const mixer = new THREE.AnimationMixer(root)
    const action = (name: string) => {
      const clip = animations.find((animation) => animation.name.toLowerCase() === name)
      return clip ? mixer.clipAction(clip) : null
    }
    return {
      model, modelLength, mixer, idle: action('idle'), swim: action('swim'), fast: action('swim fast'),
      spine: root.getObjectByName('Spine1'), tailBase: root.getObjectByName('Spine2'), jaw: root.getObjectByName('Jaw'),
      leftFin: root.getObjectByName('LeftPectoral'), rightFin: root.getObjectByName('RightPectoral'), dorsal,
      ownedGeometries, ownedMaterials,
    }
  }), [scene, animations])

  useEffect(() => {
    school.forEach((fish, index) => {
      for (const action of [fish.idle, fish.swim, fish.fast]) {
        if (!action) continue
        action.reset().play()
        action.time = (index * 0.37) % action.getClip().duration
      }
    })
    return () => {
      school.forEach((fish) => {
        fish.mixer.stopAllAction()
        fish.ownedGeometries.forEach((geometry) => geometry.dispose())
        fish.ownedMaterials.forEach((material) => material.dispose())
      })
    }
  }, [school])

  useEffect(() => {
    measuredAt.current = -Infinity
    const section = hostRef.current?.closest('section')
    if (section) section.dataset.fishPaused = String(!active)
    if (!active) { pointer.current = null; previousPointer.current = null; scare.current = null }
  }, [active, hostRef])

  useEffect(() => {
    const section = hostRef.current?.closest('section')
    if (!section) return
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = hostRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const time = performance.now() / 1000
      const last = previousPointer.current
      const speed = last ? Math.hypot(x - last.x, y - last.y) / Math.max(0.016, time - last.time) : 0
      const food = (event.target as Element).closest<HTMLElement>('[data-fish-food]')
      pointer.current = { x, y, speed, foodId: food?.dataset.fishFood, activeUntil: simulationTime.current + 3.2 }
      previousPointer.current = { x, y, time }
    }
    const leave = () => { pointer.current = null }
    const feed = (event: Event) => {
      offered.current = { id: (event as CustomEvent<string>).detail, until: simulationTime.current + 8 }
    }
    const splash = (event: PointerEvent) => {
      if (event.button !== 0) return
      const rect = hostRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const now = simulationTime.current
      water.current.splash(x, y, now)
      // The canvas never steals links or touch scrolling. Hit-test in pond space.
      const hitsFish = swimmers.current.some((fish) => {
        const dx = x - fish.x, dy = y - fish.y
        const along = dx * Math.cos(fish.heading) + dy * Math.sin(fish.heading)
        const across = -dx * Math.sin(fish.heading) + dy * Math.cos(fish.heading)
        return (along / (fish.mouthReach * 1.25)) ** 2 + (across / 25) ** 2 < 1
      })
      const food = (event.target as Element).closest('[data-fish-food]')
      if (food && !hitsFish) return
      offered.current = null
      scare.current = { x, y, activeUntil: now + 0.45, scareId: ++scareSequence.current }
    }
    section.addEventListener('pointermove', move, { passive: true })
    section.addEventListener('pointerleave', leave)
    section.addEventListener('koi-feed', feed)
    section.addEventListener('pointerdown', splash, { passive: true })
    return () => {
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      section.removeEventListener('koi-feed', feed)
      section.removeEventListener('pointerdown', splash)
      iconSprings.current.forEach(({ element }) => { element.style.transform = '' })
    }
  }, [hostRef])

  useFrame((state, delta) => {
    if (!active || document.hidden) return
    const now = simulationTime.current += Math.min(delta, 0.04)
    if (now - measuredAt.current > 0.25) {
      const host = hostRef.current
      const section = host?.closest('section')
      if (!host || !section) return
      const rect = host.getBoundingClientRect()
      const obstacles = Array.from(section.querySelectorAll<HTMLElement>('[data-fish-obstacle]')).map((element) => {
        const obstacle = element.getBoundingClientRect()
        return { left: obstacle.left - rect.left, right: obstacle.right - rect.left, top: obstacle.top - rect.top, bottom: obstacle.bottom - rect.top }
      })
      const foodElements = Array.from(section.querySelectorAll<HTMLElement>('[data-fish-food]'))
      const foods = foodElements.map((element) => {
        const icon = element.querySelector<HTMLElement>('[data-fish-icon]')!.getBoundingClientRect()
        return { id: element.dataset.fishFood!, x: icon.left + icon.width / 2 - rect.left, y: icon.top + icon.height / 2 - rect.top }
      })
      foodElements.forEach((element) => {
        const id = element.dataset.fishFood!
        const icon = element.querySelector<HTMLElement>('[data-fish-icon-motion]')
        if (icon && !iconSprings.current.has(id)) iconSprings.current.set(id, { x: 0, y: 0, vx: 0, vy: 0, element: icon })
      })
      dark.current = document.documentElement.classList.contains('dark')
      if (layout.current && Math.abs(layout.current.width - rect.width) > 2) {
        swimmers.current = []
      }
      layout.current = {
        width: rect.width, height: rect.height, obstacles, foods, foodElements,
        top: Math.max(24, -rect.top + 18), bottom: Math.min(rect.height - 24, window.innerHeight - rect.top - 18),
      }
      measuredAt.current = now
    }
    const pond = layout.current
    if (!pond || pond.bottom - pond.top < 60) return
    if (!swimmers.current.length) swimmers.current = FISH.map((_, index) => {
      const fish = createSwimmer(index, pond.width)
      fish.x = pond.width * [0.18, 0.4, 0.58][index]
      const rows = pond.obstacles.filter((rect) => fish.x >= rect.left && fish.x <= rect.right)
        .sort((a, b) => a.top - b.top)
      const gaps: number[] = []
      let end = pond.top
      for (const row of rows) {
        if (row.top > pond.bottom) break
        if (row.top - end > 36) gaps.push((row.top + end) / 2)
        end = Math.max(end, row.bottom)
      }
      if (pond.bottom - end > 36) gaps.push((pond.bottom + end) / 2)
      fish.y = gaps[Math.min(index, gaps.length - 1)] ?? 46
      fish.mouthReach = Math.max(32, FISH[index].length * (pond.width < 640 ? 0.7 : 1) * 0.47)
      return fish
    })
    const neighbors = swimmers.current.map(({ x, y, heading }) => ({ x, y, heading }))
    const worldPerPixel = state.viewport.width / state.size.width
    swimmers.current.forEach((fish, index) => {
      const offer = offered.current
      const interest = scare.current && scare.current.activeUntil > now ? scare.current : offer && offer.until > now ? {
        ...(pointer.current ?? { x: fish.x, y: fish.y }), activeUntil: offer.until, foodId: offer.id,
      } : pointer.current
      const availableFoods = pond.foods.filter((food) => food.id === fish.foodId || !swimmers.current.some((other) =>
        other !== fish && other.foodId === food.id && (other.activity === 'approach' || other.activity === 'nibble' || other.activity === 'tug')))
      swimStep(fish, neighbors.filter((_, other) => other !== index), interest, pond, pond.obstacles, now, delta, availableFoods)
      if (previousActivities.current[index] !== fish.activity && (fish.activity === 'dart' || fish.activity === 'tug')) {
        water.current.splash(fish.x, fish.y, now, fish.activity === 'dart' ? 0.8 : 0.4)
      }
      previousActivities.current[index] = fish.activity
      const rendered = school[index]
      rendered.model.visible = true
      rendered.model.position.set((fish.x - pond.width / 2) * worldPerPixel, (pond.height / 2 - fish.y) * worldPerPixel, 0)
      rendered.model.rotation.z = Math.PI / 2 - fish.heading
      const length = FISH[index].length * (pond.width < 640 ? 0.7 : 1)
      rendered.model.scale.setScalar(length * worldPerPixel / rendered.modelLength)

      const idleWeight = Math.max(1 - THREE.MathUtils.smoothstep(fish.speed, 8, 36), (1 - fish.effort) * 0.75)
      const fastWeight = THREE.MathUtils.smoothstep(fish.speed, 100, 185) * (1 - idleWeight)
      rendered.idle?.setEffectiveWeight(idleWeight)
      rendered.swim?.setEffectiveWeight(1 - idleWeight - fastWeight)
      rendered.fast?.setEffectiveWeight(fastWeight)
      const strokeRate = THREE.MathUtils.clamp(0.2 + fish.effort * 0.7 + fish.speed / 170, 0.3, 2.4)
      rendered.swim?.setEffectiveTimeScale(strokeRate)
      rendered.fast?.setEffectiveTimeScale(strokeRate)
      rendered.mixer.update(Math.min(delta, 0.04))
      // Add a little body bend into a turn on top of the authored tail animation.
      if (rendered.spine) rendered.spine.rotation.y -= fish.turn * 0.065
      if (rendered.tailBase) rendered.tailBase.rotation.y -= fish.turn * 0.095
      const scull = Math.sin(now * 6 + fish.phase) * (1 - fish.effort) * 0.1
      if (rendered.leftFin) rendered.leftFin.rotation.z += scull + Math.max(0, fish.turn) * 0.06
      if (rendered.rightFin) rendered.rightFin.rotation.z -= scull + Math.max(0, -fish.turn) * 0.06
      rendered.dorsal.rotation.x = Math.PI / 2 + Math.sin(fish.tailPhase) * fish.effort * 0.025
      if (fish.activity === 'nibble' && rendered.jaw) rendered.jaw.rotation.x += (0.5 + Math.sin(now * 14 + fish.phase) * 0.5) * 0.3
    })
    const eating = new Set(swimmers.current.filter((fish) => fish.activity === 'nibble').map((fish) => fish.foodId))
    pond.foodElements.forEach((element) => {
      const nibbling = String(eating.has(element.dataset.fishFood))
      if (element.dataset.fishNibbling !== nibbling) element.dataset.fishNibbling = nibbling
      const id = element.dataset.fishFood!
      const tugger = swimmers.current.find((fish) => fish.foodId === id && (fish.activity === 'tug' || fish.activity === 'nibble'))
      const tugging = String(tugger?.activity === 'tug')
      if (element.dataset.fishTugging !== tugging) element.dataset.fishTugging = tugging
      const spring = iconSprings.current.get(id)
      const origin = pond.foods.find((food) => food.id === id)
      if (!spring || !origin) return
      let x = 0, y = 0
      if (tugger) {
        x = tugger.x + Math.cos(tugger.heading) * tugger.mouthReach - origin.x
        y = tugger.y + Math.sin(tugger.heading) * tugger.mouthReach - origin.y
        const range = Math.hypot(x, y)
        if (range > 115) { x *= 115 / range; y *= 115 / range }
      }
      // Semi-implicit spring: mouth carries the icon, release settles it home.
      const dt = Math.min(delta, 0.025)
      const stiffness = tugger ? 160 : 100
      spring.vx += ((x - spring.x) * stiffness - spring.vx * 15) * dt
      spring.vy += ((y - spring.y) * stiffness - spring.vy * 15) * dt
      spring.x += spring.vx * dt
      spring.y += spring.vy * dt
      if (!tugger && Math.hypot(spring.x, spring.y, spring.vx, spring.vy) < 0.05) {
        spring.x = 0; spring.y = 0; spring.vx = 0; spring.vy = 0
      }
      const transform = `translate3d(${spring.x.toFixed(2)}px,${spring.y.toFixed(2)}px,0) rotate(${(spring.x * 0.2).toFixed(2)}deg)`
      if (spring.element.style.transform !== transform) spring.element.style.transform = transform
    })
    if (waterRef.current) water.current.paint(waterRef.current, swimmers.current, now, pond.width, pond.height, dark.current)
  })

  return <>{school.map((fish, index) => <primitive key={index} object={fish.model} dispose={null} />)}</>
}

export default function KoiPond({ hostRef, active }: PondProps) {
  const reduceMotion = useSyncExternalStore(subscribeMotionPreference, () => window.matchMedia(motionQuery).matches, () => true)
  const waterRef = useRef<HTMLCanvasElement>(null)
  if (reduceMotion) return null
  return (
    <>
      <canvas ref={waterRef} data-pond-water="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      <Canvas
        aria-hidden="true"
        frameloop={active ? 'always' : 'never'}
        className="pointer-events-none !absolute inset-0"
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[-2, 3, 5]} intensity={2.4} color="#fff5e7" />
        <Suspense fallback={null}><FishSchool hostRef={hostRef} active={active} waterRef={waterRef} /></Suspense>
      </Canvas>
    </>
  )
}
