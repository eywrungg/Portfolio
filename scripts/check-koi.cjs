const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Exercise the actual pure simulation without adding a test framework.
const modules = new Map()
function load(name) {
  const filename = path.resolve(__dirname, '../src/lib', `${name}.ts`)
  if (modules.has(filename)) return modules.get(filename)
  const module = { exports: {} }
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  new Function('require', 'module', 'exports', outputText)(name => load(name.replace('./', '')), module, module.exports)
  modules.set(filename, module.exports)
  return module.exports
}
const { createSwimmer, swimStep } = load('fishSwimming')
const { clearKoiSegment, koiWaypoints } = load('koiPathfinding')

// A blocked straight line must detour around the obstacle using Dijkstra.
const wall = { left: 200, right: 300, top: 100, bottom: 300 }
const start = { x: 100, y: 200 }, goal = { x: 400, y: 200 }
const route = koiWaypoints(start, goal, [wall], wall, 500, 400)
assert(route.length > 1)
let prior = start
for (const point of route) { assert(clearKoiSegment(prior, point, [wall], 7)); prior = point }
assert.deepEqual(route.at(-1), goal)
assert.equal(clearKoiSegment({ x: 250, y: 309.0001 }, { x: 250, y: 308.9999 }, [wall], 9), false,
  'subpixel movement cannot slip inside a collision edge and strand a fish')

const overlapped = createSwimmer(0, 500)
Object.assign(overlapped, { x: 250, y: 308.99, heading: Math.PI / 2, nextSnack: 999 })
for (let i = 0; i < 120; i++) swimStep(overlapped, [], null, { width: 500, height: 500, top: 0, bottom: 500 }, [wall], i / 60, 1 / 60)
assert(clearKoiSegment(overlapped, overlapped, [wall], 9), 'a panel moving around a fish cannot trap it')

for (const width of [1100, 390]) {
  const bounds = { width, height: 900, top: 24, bottom: 870 }
  const obstacles = [
    { left: 35, right: width * 0.68, top: 140, bottom: 170 },
    { left: 35, right: 170, top: 260, bottom: 300 },
    { left: 35, right: 170, top: 480, bottom: 520 },
    { left: 35, right: 170, top: 690, bottom: 730 },
  ]
  const foods = [{ id: 'React', x: 55, y: 280 }, { id: 'VS Code', x: 55, y: 500 }, { id: 'Photoshop', x: 55, y: 710 }]
  const fish = createSwimmer(0, width)
  fish.x = 55; fish.y = 230; fish.heading = Math.PI / 2
  const activities = new Set(), gaits = new Set(), grabbed = new Set()
  let fastest = 0, slowest = Infinity, walked = 0
  for (let frame = 0; frame < 7200; frame++) {
    const previous = { x: fish.x, y: fish.y }
    const now = frame / 60
    const pointer = frame === 4500 ? { x: fish.x - 15, y: fish.y, activeUntil: now + 0.4, scareId: 1 } : null
    swimStep(fish, [], pointer, bounds, obstacles, now, 1 / 60, foods)
    activities.add(fish.activity); gaits.add(fish.gait)
    if (fish.activity === 'tug') grabbed.add(fish.foodId)
    assert(Number.isFinite(fish.x + fish.y + fish.speed + fish.heading))
    assert(clearKoiSegment(previous, fish, obstacles, 8), 'must not cross an obstacle')
    const dx = fish.x - previous.x, dy = fish.y - previous.y
    assert(Math.abs(dx * Math.sin(fish.heading) - dy * Math.cos(fish.heading)) < 1e-6, 'moves nose-first')
    assert(Math.hypot(dx, dy) < 5, 'no teleports')
    walked += Math.hypot(dx, dy)
    fastest = Math.max(fastest, fish.speed); slowest = Math.min(slowest, fish.speed)
  }
  assert(activities.has('tug'), 'fish must carry an icon')
  assert(activities.has('dart'), 'click must startle a fish')
  assert(gaits.has('glide') && gaits.has('stroke'))
  assert(fastest > 100 && slowest < 30 && walked > 1500)
  console.log(`${width}px: ${[...activities].join(', ')}; grabbed ${[...grabbed].join(', ')}; speed ${slowest.toFixed(1)}–${fastest.toFixed(1)}; distance ${walked.toFixed(0)}px`)
}

for (const activity of ['nibble', 'tug']) {
  const fish = createSwimmer(0, 900)
  Object.assign(fish, { x: 450, y: 450, activity, foodId: 'React', foodCenter: { x: 480, y: 450 }, activityUntil: 10 })
  swimStep(fish, [], { x: 440, y: 450, activeUntil: 1, scareId: 1 }, { width: 900, height: 900, top: 0, bottom: 900 }, [], 0, 1 / 60)
  assert.equal(fish.activity, 'dart', 'startle preempts a stationary grip or carry')
  assert.equal(fish.foodId, undefined, 'startle releases the icon')
}
console.log('Koi routing, propulsion, icon carrying, and escape checks passed.')
