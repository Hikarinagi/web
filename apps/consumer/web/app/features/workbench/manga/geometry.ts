export type Point = [number, number]

export interface Bounds {
  x0: number
  y0: number
  x1: number
  y1: number
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))

const round = (value: number) => Math.round(value * 10_000) / 10_000

export function boundsOf(vertices: Point[], x: number, y: number): Bounds {
  if (vertices.length < 3) return { x0: x, y0: y, x1: x, y1: y }
  const xs = vertices.map(point => point[0])
  const ys = vertices.map(point => point[1])
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
}

export function rectFrom(a: Point, b: Point): { vertices: Point[]; x: number; y: number } {
  const x0 = round(clamp(Math.min(a[0], b[0])))
  const y0 = round(clamp(Math.min(a[1], b[1])))
  const x1 = round(clamp(Math.max(a[0], b[0])))
  const y1 = round(clamp(Math.max(a[1], b[1])))
  return {
    vertices: [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    x: round((x0 + x1) / 2),
    y: round((y0 + y1) / 2),
  }
}

export function shift(
  vertices: Point[],
  x: number,
  y: number,
  dx: number,
  dy: number,
): { vertices: Point[]; x: number; y: number } {
  const bounds = boundsOf(vertices, x, y)
  const moveX = Math.min(1 - bounds.x1, Math.max(-bounds.x0, dx))
  const moveY = Math.min(1 - bounds.y1, Math.max(-bounds.y0, dy))
  return {
    vertices: vertices.map(([px, py]) => [round(px + moveX), round(py + moveY)] as Point),
    x: round(x + moveX),
    y: round(y + moveY),
  }
}

export function sortKeyBetween(before: number | undefined, after: number | undefined): number {
  if (before === undefined && after === undefined) return 1024
  if (before === undefined) return (after as number) - 1024
  if (after === undefined) return before + 1024
  return (before + after) / 2
}
