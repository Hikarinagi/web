import type { MermaidEdge, MermaidGraph, MermaidNode, MermaidShape } from './parse'

export interface LaidOutNode extends MermaidNode {
  x: number
  y: number
  width: number
  height: number
}

export interface LaidOutEdge {
  id: string
  d: string
  dashed: boolean
  arrow: boolean
  variant?: string
  label?: string
  labelX: number
  labelY: number
  labelWidth: number
}

export interface MermaidLayout {
  width: number
  height: number
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
}

const FONT_SIZE = 14
const PADDING_X = 44
const MIN_WIDTH = 96
const BASE_HEIGHT = 48
const GAP_MAIN = 76
const GAP_CROSS = 36
const MARGIN = 20
const CORNER = 14

function textWidth(label: string): number {
  let units = 0
  for (const char of label) units += char.charCodeAt(0) > 0x2e80 ? 1 : 0.56
  return units * FONT_SIZE
}

function sizeOf(label: string, shape: MermaidShape) {
  const width = Math.max(MIN_WIDTH, Math.round(textWidth(label)) + PADDING_X)
  if (shape === 'diamond') return { width: width * 1.35, height: BASE_HEIGHT + 18 }
  return { width, height: BASE_HEIGHT }
}

function rankNodes(graph: MermaidGraph): Map<string, number> {
  const ranks = new Map(graph.nodes.map(node => [node.id, 0]))
  for (let pass = 0; pass < graph.nodes.length; pass += 1) {
    let moved = false
    for (const edge of graph.edges) {
      const next = (ranks.get(edge.from) ?? 0) + 1
      if (next > (ranks.get(edge.to) ?? 0)) {
        ranks.set(edge.to, next)
        moved = true
      }
    }
    if (!moved) break
  }
  return ranks
}

function orderRanks(graph: MermaidGraph, ranks: Map<string, number>): string[][] {
  const columns: string[][] = []
  for (const node of graph.nodes) {
    const rank = ranks.get(node.id) ?? 0
    ;(columns[rank] ??= []).push(node.id)
  }

  const incoming = new Map<string, string[]>()
  for (const edge of graph.edges) {
    incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge.from])
  }

  for (let pass = 0; pass < 2; pass += 1) {
    for (let rank = 1; rank < columns.length; rank += 1) {
      const previous = columns[rank - 1] ?? []
      const index = new Map(previous.map((id, position) => [id, position]))
      const current = columns[rank] ?? []
      const weight = new Map(
        current.map((id, position) => {
          const parents = (incoming.get(id) ?? [])
            .map(parent => index.get(parent))
            .filter((value): value is number => value !== undefined)
          const barycenter = parents.length
            ? parents.reduce((sum, value) => sum + value, 0) / parents.length
            : position
          return [id, barycenter]
        }),
      )
      columns[rank] = [...current].sort((a, b) => (weight.get(a) ?? 0) - (weight.get(b) ?? 0))
    }
  }

  return columns.map(column => column ?? [])
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2
}

function assignLanes(graph: MermaidGraph, columns: string[][]): Map<string, number> {
  const parents = new Map<string, string[]>()
  const children = new Map<string, string[]>()
  for (const edge of graph.edges) {
    parents.set(edge.to, [...(parents.get(edge.to) ?? []), edge.from])
    children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to])
  }

  const lanes = new Map<string, number>()
  for (const column of columns) {
    const taken = new Set<number>()
    for (const id of column) {
      const inherited = (parents.get(id) ?? [])
        .map(parent => lanes.get(parent))
        .filter((value): value is number => value !== undefined)
      let lane = inherited.length ? Math.round(median(inherited)) : 0
      while (taken.has(lane)) lane += 1
      taken.add(lane)
      lanes.set(id, lane)
    }
  }

  for (let rank = columns.length - 1; rank >= 0; rank -= 1) {
    for (const id of columns[rank] ?? []) {
      const kids = (children.get(id) ?? [])
        .map(child => lanes.get(child))
        .filter((value): value is number => value !== undefined)
      if (kids.length > 1) lanes.set(id, median(kids))
    }
  }

  const lowest = Math.min(...lanes.values())
  for (const [id, lane] of lanes) lanes.set(id, lane - lowest)
  return lanes
}

function elbow(sx: number, sy: number, tx: number, ty: number, horizontal: boolean): string {
  const main = horizontal ? tx - sx : ty - sy
  const cross = horizontal ? ty - sy : tx - sx
  if (Math.abs(cross) < 1) return horizontal ? `M${sx} ${sy} H${tx}` : `M${sx} ${sy} V${ty}`

  const mid = horizontal ? sx + main / 2 : sy + main / 2
  const radius = Math.min(CORNER, Math.abs(main) / 2, Math.abs(cross) / 2)
  const step = cross > 0 ? radius : -radius

  return horizontal
    ? `M${sx} ${sy} H${mid - radius} Q${mid} ${sy} ${mid} ${sy + step} V${ty - step} Q${mid} ${ty} ${mid + radius} ${ty} H${tx}`
    : `M${sx} ${sy} V${mid - radius} Q${sx} ${mid} ${sx + step} ${mid} H${tx - step} Q${tx} ${mid} ${tx} ${mid + radius} V${ty}`
}

function labelSpot(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  horizontal: boolean,
  label: string,
) {
  const labelWidth = label ? Math.round(textWidth(label)) + 16 : 0
  const straight = Math.abs(horizontal ? ty - sy : tx - sx) < 1
  const mid = horizontal ? (sx + tx) / 2 : (sy + ty) / 2
  if (straight) {
    return horizontal
      ? { labelX: mid, labelY: sy - 15, labelWidth }
      : { labelX: sx + labelWidth / 2 + 12, labelY: mid, labelWidth }
  }
  return horizontal
    ? { labelX: (mid + tx) / 2, labelY: ty, labelWidth }
    : { labelX: sx, labelY: (mid + ty) / 2, labelWidth }
}

export function layoutMermaid(graph: MermaidGraph): MermaidLayout {
  const horizontal = graph.direction === 'LR'
  const ranks = rankNodes(graph)
  const columns = orderRanks(graph, ranks)
  const sizes = new Map(graph.nodes.map(node => [node.id, sizeOf(node.label, node.shape)]))
  const placed = new Map<string, LaidOutNode>()

  const columnExtent = columns.map(column =>
    Math.max(0, ...column.map(id => (horizontal ? sizes.get(id)!.width : sizes.get(id)!.height))),
  )
  const labelGap: number[] = []
  for (const edge of graph.edges) {
    if (!edge.label) continue
    const rank = columns.findIndex(column => column.includes(edge.to))
    if (rank < 0) continue
    labelGap[rank] = Math.max(labelGap[rank] ?? 0, Math.round(textWidth(edge.label)) + 40)
  }

  const lanes = assignLanes(graph, columns)
  const lanePitch =
    Math.max(
      0,
      ...graph.nodes.map(node =>
        horizontal ? sizes.get(node.id)!.height : sizes.get(node.id)!.width,
      ),
    ) + GAP_CROSS

  let mainOffset = MARGIN
  columns.forEach((column, rank) => {
    if (rank > 0) mainOffset += labelGap[rank] ?? 0
    for (const id of column) {
      const node = graph.nodes.find(entry => entry.id === id) as MermaidNode
      const size = sizes.get(id)!
      const main =
        mainOffset + ((columnExtent[rank] ?? 0) - (horizontal ? size.width : size.height)) / 2
      const cross =
        MARGIN +
        (lanes.get(id) ?? 0) * lanePitch +
        (lanePitch - GAP_CROSS - (horizontal ? size.height : size.width)) / 2
      placed.set(id, {
        ...node,
        ...size,
        x: horizontal ? main : cross,
        y: horizontal ? cross : main,
      })
    }
    mainOffset += (columnExtent[rank] ?? 0) + GAP_MAIN
  })

  const edges: LaidOutEdge[] = graph.edges.flatMap((edge: MermaidEdge, index) => {
    const from = placed.get(edge.from)
    const to = placed.get(edge.to)
    if (!from || !to) return []

    const sx = horizontal ? from.x + from.width : from.x + from.width / 2
    const sy = horizontal ? from.y + from.height / 2 : from.y + from.height
    const tx = horizontal ? to.x : to.x + to.width / 2
    const ty = horizontal ? to.y + to.height / 2 : to.y

    return [
      {
        id: `${edge.from}-${edge.to}-${index}`,
        d: elbow(sx, sy, tx, ty, horizontal),
        dashed: edge.dashed,
        arrow: edge.arrow,
        ...(to.variant ? { variant: to.variant } : {}),
        ...(edge.label ? { label: edge.label } : {}),
        ...labelSpot(sx, sy, tx, ty, horizontal, edge.label ?? ''),
      },
    ]
  })

  const nodes = [...placed.values()]
  return {
    width: Math.max(...nodes.map(node => node.x + node.width), 0) + MARGIN,
    height: Math.max(...nodes.map(node => node.y + node.height), 0) + MARGIN,
    nodes,
    edges,
  }
}
