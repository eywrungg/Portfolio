export type KoiPoint = { x: number; y: number }
export type KoiRect = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>

const distance = (a: KoiPoint, b: KoiPoint) => Math.hypot(a.x - b.x, a.y - b.y)

function blocked(point: KoiPoint, cards: KoiRect[], clearance: number) {
  return cards.some((card) => point.x > card.left - clearance && point.x < card.right + clearance
    && point.y > card.top - clearance && point.y < card.bottom + clearance)
}

// The segment is checked against each card, including its corners. This lets the
// graph use diagonal shortcuts without swimming through the middle of a tile.
export function clearKoiSegment(a: KoiPoint, b: KoiPoint, cards: KoiRect[], clearance: number) {
  return cards.every((card) => {
    const left = card.left - clearance
    const right = card.right + clearance
    const top = card.top - clearance
    const bottom = card.bottom + clearance
    let enter = 0
    let leave = 1
    const dx = b.x - a.x
    const dy = b.y - a.y
    for (const [origin, direction, min, max] of [[a.x, dx, left, right], [a.y, dy, top, bottom]]) {
      if (Math.abs(direction) < 1e-9) {
        if (origin <= min || origin >= max) return true
        continue
      }
      const t0 = (min - origin) / direction
      const t1 = (max - origin) / direction
      enter = Math.max(enter, Math.min(t0, t1))
      leave = Math.min(leave, Math.max(t0, t1))
      if (enter > leave) return true
    }
    return leave <= 0 || enter >= 1
  })
}

export function koiWaypoints(start: KoiPoint, goal: KoiPoint, cards: KoiRect[], grid: KoiRect, width: number, height: number) {
  const clearance = 7
  const candidates: KoiPoint[] = []
  // Corner visibility keeps the graph small even with many individual icons.
  for (const rect of [grid, ...cards]) {
    const padding = rect === grid ? 32 : 15
    for (const x of [rect.left - padding, rect.right + padding]) {
      for (const y of [rect.top - padding, rect.bottom + padding]) {
        candidates.push({ x: Math.max(8, Math.min(width - 8, x)), y: Math.max(16, Math.min(height - 16, y)) })
      }
    }
  }
  const nodes = [...new Map(candidates.filter((point) => !blocked(point, cards, clearance))
    .map((point) => [`${Math.round(point.x)},${Math.round(point.y)}`, point])).values()]

  // A cursor over a card attracts the fish to the nearest reachable gap.
  const destination = blocked(goal, cards, clearance)
    ? nodes.reduce((nearest, node) => distance(node, goal) < distance(nearest, goal) ? node : nearest, nodes[0] ?? start)
    : goal
  const all = [start, ...nodes, destination]
  const target = all.length - 1
  const distances = Array<number>(all.length).fill(Infinity)
  const previous = Array<number>(all.length).fill(-1)
  const visited = Array<boolean>(all.length).fill(false)
  distances[0] = 0

  // Dijkstra on a small visibility graph: edge weight is actual swim distance.
  for (let step = 0; step < all.length; step++) {
    let current = -1
    for (let i = 0; i < all.length; i++) {
      if (!visited[i] && (current === -1 || distances[i] < distances[current])) current = i
    }
    if (current === -1 || !Number.isFinite(distances[current]) || current === target) break
    visited[current] = true
    for (let next = 1; next < all.length; next++) {
      if (next === current || visited[next]) continue
      if (!clearKoiSegment(all[current], all[next], cards, clearance)) continue
      const candidate = distances[current] + distance(all[current], all[next])
      if (candidate < distances[next]) {
        distances[next] = candidate
        previous[next] = current
      }
    }
  }

  if (!Number.isFinite(distances[target])) return []
  const route: KoiPoint[] = []
  for (let at = target; at > 0; at = previous[at]) route.unshift(all[at])
  return route
}
