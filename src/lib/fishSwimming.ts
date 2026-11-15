import { clearKoiSegment, koiWaypoints, type KoiPoint, type KoiRect } from './koiPathfinding'

export type PondBounds = { width: number; height: number; top: number; bottom: number }
export type FishFood = KoiPoint & { id: string }
export type Swimmer = KoiPoint & {
  heading: number
  turn: number
  speed: number
  pace: number
  seed: number
  phase: number
  goal: KoiPoint
  route: KoiPoint[]
  nextRoute: number
  nextDecision: number
  nextPace: number
  curious: boolean
  activity: 'roam' | 'approach' | 'nibble' | 'tug' | 'depart' | 'dart'
  activityUntil: number
  foodId?: string
  foodCenter?: KoiPoint
  lastFood?: string
  nextSnack: number
  mouthReach: number
  wander: number
  wanderTarget: number
  nextWander: number
  gait: 'stroke' | 'glide'
  nextGait: number
  effort: number
  tailPhase: number
  lastScare: number
  dartStarted: number
}
export type FishPointer = KoiPoint & { activeUntil: number; speed?: number; foodId?: string; scareId?: number }
type Neighbor = KoiPoint & { heading: number }

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const distance = (a: KoiPoint, b: KoiPoint) => Math.hypot(a.x - b.x, a.y - b.y)
const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt))

function random(fish: Swimmer) {
  fish.seed = (Math.imul(fish.seed, 1664525) + 1013904223) >>> 0
  return fish.seed / 4294967296
}

export function createSwimmer(index: number, width: number): Swimmer {
  const x = width * [0.18, 0.5, 0.8][index]
  const y = 46 + index * 15
  return {
    x, y, heading: index === 1 ? Math.PI - 0.2 : 0.2, turn: 0, speed: 45,
    pace: 62 - index * 6, seed: 6317 + index * 1879, phase: index * 2.1,
    goal: { x, y }, route: [], nextRoute: 0, nextDecision: 0, nextPace: 0, curious: false,
    activity: 'roam', activityUntil: 0, nextSnack: 3 + index * 3.5, mouthReach: 45,
    wander: 0, wanderTarget: 0, nextWander: 0,
    gait: 'stroke', nextGait: 0, effort: 0.6, tailPhase: index * 2.1, lastScare: -1, dartStarted: -10,
  }
}

function snackDock(fish: Swimmer, foods: FishFood[], bounds: PondBounds, obstacles: KoiRect[], offered?: string) {
  let best: { food: FishFood; point: KoiPoint; score: number } | null = null
  for (const food of foods) {
    if (food.y < bounds.top || food.y > bounds.bottom) continue
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const point = { x: food.x + dx * fish.mouthReach, y: food.y + dy * fish.mouthReach }
      if (point.x < 18 || point.x > bounds.width - 18 || point.y < 20 || point.y > bounds.height - 20) continue
      if (!clearKoiSegment(point, point, obstacles, 12)) continue
      const score = distance(fish, point) + (food.id === fish.lastFood ? 240 : 0) - (food.id === offered ? 1200 : 0)
      if (!best || score < best.score) best = { food, point, score }
    }
  }
  return best
}

function chooseGoal(fish: Swimmer, bounds: PondBounds, obstacles: KoiRect[]) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const point = {
      x: 18 + random(fish) * Math.max(1, bounds.width - 36),
      y: bounds.top + random(fish) * Math.max(1, bounds.bottom - bounds.top),
    }
    if (distance(fish, point) < 140) continue
    if (obstacles.some((rect) => point.x > rect.left - 12 && point.x < rect.right + 12
      && point.y > rect.top - 12 && point.y < rect.bottom + 12)) continue
    return point
  }
  // Clear water above the first row is always available, including on phones.
  return { x: bounds.width * (0.2 + random(fish) * 0.6), y: 45 }
}

function releaseIcon(fish: Swimmer, now: number) {
  fish.lastFood = fish.foodId
  fish.foodId = undefined
  fish.foodCenter = undefined
  fish.nextSnack = now + 7 + random(fish) * 10
}

function escapeGoal(fish: Swimmer, point: KoiPoint, bounds: PondBounds, obstacles: KoiRect[]) {
  const away = Math.atan2(fish.y - point.y, fish.x - point.x)
  let best = { x: fish.x, y: fish.y }
  let score = -Infinity
  // Find open water before accelerating, including when startled next to a row.
  for (const angle of [0, -0.55, 0.55, -1.15, 1.15, Math.PI]) {
    for (const length of [300, 170, 80]) {
      const candidate = {
        x: clamp(fish.x + Math.cos(away + angle) * length, 20, bounds.width - 20),
        y: clamp(fish.y + Math.sin(away + angle) * length, 25, bounds.height - 25),
      }
      if (!clearKoiSegment(candidate, candidate, obstacles, 12)) continue
      const value = distance(candidate, point) + (clearKoiSegment(fish, candidate, obstacles, 10) ? 180 : 0)
      if (value > score) { best = candidate; score = value }
    }
  }
  return best
}

// Behavioral timing is inspired by observed koi burst/coast and turning bouts,
// not a fluid-dynamics model. References: docs/koi-behavior.md.
function updateGait(fish: Swimmer, now: number, dt: number) {
  if (now >= fish.nextGait) {
    fish.gait = fish.gait === 'stroke' ? 'glide' : 'stroke'
    fish.nextGait = now + (fish.gait === 'stroke' ? 0.45 + random(fish) * 0.55 : 0.7 + random(fish) * 1.3)
  }
  const effort = fish.activity === 'dart' ? 1
    : fish.activity === 'nibble' ? 0.12
    : fish.activity === 'tug' ? 0.55
    : fish.gait === 'stroke' ? 0.7 : 0.08
  fish.effort = damp(fish.effort, effort, 6, dt)
  fish.tailPhase += dt * (2 + fish.speed * 0.035) * (0.25 + fish.effort) * Math.PI
}

export function swimStep(
  fish: Swimmer,
  neighbors: Neighbor[],
  pointer: FishPointer | null,
  bounds: PondBounds,
  obstacles: KoiRect[],
  now: number,
  delta: number,
  foods: FishFood[] = [],
) {
  const dt = Math.min(delta, 0.04)
  updateGait(fish, now, dt)
  const click = pointer?.scareId !== undefined && pointer.scareId !== fish.lastScare
  if (pointer && pointer.activeUntil > now && now > fish.dartStarted + 0.65
    && ((click && distance(fish, pointer) < 240) || ((pointer.speed ?? 0) > 1400 && distance(fish, pointer) < 85))) {
    fish.lastScare = pointer.scareId ?? fish.lastScare
    fish.goal = escapeGoal(fish, pointer, bounds, obstacles)
    releaseIcon(fish, now)
    fish.activity = 'dart'
    fish.dartStarted = now
    fish.activityUntil = now + 1.8 + random(fish) * 0.7
    fish.nextDecision = fish.activityUntil + 1
    fish.nextRoute = 0
    fish.pace = 205 + random(fish) * 40
    fish.nextPace = fish.activityUntil
  }
  if (fish.activity === 'nibble') {
    if (now < fish.activityUntil && fish.foodCenter) {
      const angle = Math.atan2(fish.foodCenter.y - fish.y, fish.foodCenter.x - fish.x)
      const error = Math.atan2(Math.sin(angle - fish.heading), Math.cos(angle - fish.heading))
      fish.heading += clamp(error, -dt, dt)
      fish.speed = damp(fish.speed, 0, 5, dt)
      fish.turn = damp(fish.turn, 0, 4, dt)
      return
    }
    fish.goal = escapeGoal(fish, fish.foodCenter ?? fish, bounds, obstacles)
    fish.activity = 'tug'
    fish.activityUntil = now + 2.2 + random(fish) * 0.8
    fish.nextRoute = 0
  }
  if (fish.activity === 'tug' && (now >= fish.activityUntil || (fish.foodCenter && distance(fish, fish.foodCenter) > 125))) {
    releaseIcon(fish, now)
    fish.activity = 'depart'
    fish.activityUntil = now + 2
    fish.nextDecision = now + 2.5
  }
  if ((fish.activity === 'depart' || fish.activity === 'dart') && now >= fish.activityUntil) fish.activity = 'roam'
  if (fish.activity === 'approach' && now >= fish.activityUntil) {
    fish.activity = 'roam'
    fish.foodId = undefined
    fish.foodCenter = undefined
    fish.nextSnack = now + 4
    fish.nextDecision = 0
  }
  const offer = pointer && pointer.activeUntil > now ? pointer.foodId : undefined
  if (fish.activity === 'roam' && (now >= fish.nextSnack || (offer && offer !== fish.lastFood))) {
    const snack = snackDock(fish, foods, bounds, obstacles, offer)
    if (snack) {
      fish.foodId = snack.food.id
      fish.foodCenter = { x: snack.food.x, y: snack.food.y }
      fish.goal = snack.point
      fish.activity = 'approach'
      fish.activityUntil = now + 20
      fish.nextRoute = 0
    } else fish.nextSnack = now + 4
  }
  if (fish.activity === 'approach' && distance(fish, fish.goal) < 12 && fish.foodCenter) {
    const angle = Math.atan2(fish.foodCenter.y - fish.y, fish.foodCenter.x - fish.x)
    const error = Math.atan2(Math.sin(angle - fish.heading), Math.cos(angle - fish.heading))
    fish.heading += clamp(error, -1.6 * dt, 1.6 * dt)
    fish.speed = damp(fish.speed, 0, 5, dt)
    if (Math.abs(error) < 0.25) {
      fish.activity = 'nibble'
      fish.activityUntil = now + 0.4 + random(fish) * 0.3
    }
    return
  }
  const focused = fish.activity !== 'roam'
  const curious = !focused && !!pointer && !pointer.foodId && pointer.activeUntil > now
    && (pointer.speed ?? 0) < 900 && distance(fish, pointer) < 460
  const changedMode = curious !== fish.curious
  fish.curious = curious
  if (curious && pointer) {
    // Investigate beside the pointer, leaving room for the other fish to arrive.
    const orbit = fish.phase + now * 0.16
    fish.goal = {
      x: clamp(pointer.x + Math.cos(orbit) * 65, 18, bounds.width - 18),
      y: clamp(pointer.y + Math.sin(orbit) * 65, 20, bounds.height - 20),
    }
  } else if (!focused && (changedMode || now >= fish.nextDecision || (!fish.route.length && now > fish.nextRoute))) {
    fish.goal = chooseGoal(fish, bounds, obstacles)
    fish.nextDecision = now + 12 + random(fish) * 8
    fish.nextRoute = 0
  }

  if (changedMode || now >= fish.nextRoute) {
    const routeBounds = obstacles.length ? {
      left: Math.min(...obstacles.map((rect) => rect.left)), right: Math.max(...obstacles.map((rect) => rect.right)),
      top: Math.min(...obstacles.map((rect) => rect.top)), bottom: Math.max(...obstacles.map((rect) => rect.bottom)),
    } : { left: 0, right: bounds.width, top: 0, bottom: bounds.height }
    fish.route = koiWaypoints(fish, fish.goal, obstacles,
      routeBounds, bounds.width, bounds.height)
    fish.nextRoute = now + (curious ? 0.8 : 1.6)
  }
  while (fish.route.length && distance(fish, fish.route[0]) < 24) {
    if (fish.activity === 'approach' && fish.route.length === 1 && distance(fish, fish.route[0]) >= 7) break
    const next = fish.route[1]
    if (next && !clearKoiSegment(fish, next, obstacles, 10)) {
      if (distance(fish, fish.route[0]) >= 7) break
    }
    fish.route.shift()
  }
  const waypoint = fish.route[0]

  if (now >= fish.nextPace) {
    const mood = random(fish)
    fish.pace = mood > 0.77 ? 130 + random(fish) * 35
      : mood < 0.2 ? 25 + random(fish) * 18 : 52 + random(fish) * 28
    fish.nextPace = now + (mood > 0.77 ? 0.7 + random(fish) : 2 + random(fish) * 3)
  }

  let desiredX = waypoint ? waypoint.x - fish.x : Math.cos(fish.heading) * 40
  let desiredY = waypoint ? waypoint.y - fish.y : Math.sin(fish.heading) * 40
  const length = Math.hypot(desiredX, desiredY) || 1
  desiredX /= length
  desiredY /= length
  for (const other of neighbors) {
    const separation = distance(fish, other)
    if (separation < 0.01 || separation > 180) continue
    if (separation < 95) {
      const strength = (95 - separation) / 95
      desiredX += (fish.x - other.x) / separation * strength * 1.4
      desiredY += (fish.y - other.y) / separation * strength * 1.4
    } else {
      desiredX += Math.cos(other.heading) * 0.1
      desiredY += Math.sin(other.heading) * 0.1
    }
  }

  // Keep room to turn before reaching a wall; this takes priority over flocking.
  for (const rect of obstacles) {
    const dx = fish.x - clamp(fish.x, rect.left, rect.right)
    const dy = fish.y - clamp(fish.y, rect.top, rect.bottom)
    const gap = Math.hypot(dx, dy)
    if (gap > 0 && gap < 28) {
      const strength = (28 - gap) / 28 * 3.5
      desiredX += dx / gap * strength
      desiredY += dy / gap * strength
    }
  }
  if (fish.x < 18) desiredX += (18 - fish.x) / 10
  if (fish.x > bounds.width - 18) desiredX -= (fish.x - bounds.width + 18) / 10
  if (fish.y < 26) desiredY += (26 - fish.y) / 10
  if (fish.y > bounds.height - 26) desiredY -= (fish.y - bounds.height + 26) / 10

  // A sticky panel or a font/layout change can move around a fish. Swim out of
  // the overlap instead of freezing forever at the old collision boundary.
  const overlaps = obstacles.filter((rect) => !clearKoiSegment(fish, fish, [rect], 9))
  if (overlaps.length) {
    const exits = overlaps.flatMap((rect) => [
      { x: rect.left - 11, y: fish.y }, { x: rect.right + 11, y: fish.y },
      { x: fish.x, y: rect.top - 11 }, { x: fish.x, y: rect.bottom + 11 },
    ]).filter((point) => clearKoiSegment(point, point, obstacles, 9))
      .sort((a, b) => distance(fish, a) - distance(fish, b))
    if (exits[0]) { desiredX = exits[0].x - fish.x; desiredY = exits[0].y - fish.y }
    fish.nextRoute = 0
  }

  if (now >= fish.nextWander) {
    fish.wanderTarget = clamp(fish.wanderTarget + (random(fish) - 0.5) * 0.45, -0.55, 0.55)
    fish.nextWander = now + 0.8 + random(fish) * 1.4
  }
  fish.wander = damp(fish.wander, fish.wanderTarget, 1.5, dt)
  const drift = fish.activity === 'roam' && length > 85 ? fish.wander * 0.35 : 0
  const desiredHeading = Math.atan2(desiredY, desiredX) + drift
  const error = Math.atan2(Math.sin(desiredHeading - fish.heading), Math.cos(desiredHeading - fish.heading))
  const turningLimit = fish.activity === 'dart' ? 5 : fish.activity === 'tug' ? 3.2 : 2.1
  fish.turn = damp(fish.turn, clamp(error * 3.6, -turningLimit, turningLimit), fish.activity === 'dart' ? 9 : 4, dt)
  fish.heading += fish.turn * dt
  const turnSlowdown = 0.3 + 0.7 * Math.max(0, Math.cos(error))
  const stroke = Math.sin(fish.tailPhase * 2) * fish.effort * 9
  const cornerSlowdown = fish.route.length > 1 ? clamp(length / 65, 0.25, 1) : 1
  const approachSlowdown = fish.activity === 'approach' && fish.route.length <= 1 ? clamp(length / 75, 0.14, 1) : 1
  const pace = fish.activity === 'approach' ? Math.min(fish.pace, 85) : fish.activity === 'tug' ? 44 : fish.pace
  // A push from the tail, then retained forward momentum during the glide.
  const propulsion = fish.activity === 'dart' || fish.activity === 'tug' ? 1 : fish.gait === 'stroke' ? 1.32 : 0.56
  const recoil = fish.activity === 'dart' && now - fish.dartStarted < 0.16 ? 0.18 : 1
  const desiredSpeed = (pace * propulsion + (curious ? 12 : 0) + stroke) * turnSlowdown * cornerSlowdown * approachSlowdown * recoil
  const acceleration = fish.activity === 'dart' ? 5 : fish.gait === 'glide' ? 0.65 : 2.8
  fish.speed = damp(fish.speed, desiredSpeed, desiredSpeed > fish.speed ? acceleration : 2.1, dt)

  // Propulsion follows the nose. Steering changes the heading before translation.
  const next = {
    x: fish.x + Math.cos(fish.heading) * fish.speed * dt,
    y: fish.y + Math.sin(fish.heading) * fish.speed * dt,
  }
  if (next.x >= 8 && next.x <= bounds.width - 8 && next.y >= 16 && next.y <= bounds.height - 16
    && clearKoiSegment(fish, next, overlaps.length ? obstacles.filter((rect) => !overlaps.includes(rect)) : obstacles, 9)) {
    fish.x = next.x
    fish.y = next.y
  } else {
    fish.speed = damp(fish.speed, 8, 6, dt)
  }
}
