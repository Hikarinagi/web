export type MermaidDirection = 'LR' | 'TD'
export type MermaidShape = 'rect' | 'round' | 'stadium' | 'diamond'

export interface MermaidNode {
  id: string
  label: string
  shape: MermaidShape
  variant?: string
}

export interface MermaidEdge {
  from: string
  to: string
  label?: string
  dashed: boolean
  arrow: boolean
}

export interface MermaidGraph {
  direction: MermaidDirection
  nodes: MermaidNode[]
  edges: MermaidEdge[]
}

const HEADER = /^(?:flowchart|graph)\s+(LR|RL|TD|TB|BT)\s*$/i
const CONNECTOR = /^(-\.->|-\.-|-->|---|==>)\s*(?:\|([^|]*)\|)?\s*/
const NODE =
  /^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*(?:\(\[([^\]]*)\]\)|\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\})?\s*(?::::([A-Za-z0-9_-]+))?\s*/

function normalizeDirection(raw: string): MermaidDirection {
  return raw.toUpperCase() === 'LR' || raw.toUpperCase() === 'RL' ? 'LR' : 'TD'
}

function shapeOf(match: RegExpMatchArray): { shape: MermaidShape; label?: string } {
  if (match[2] !== undefined) return { shape: 'stadium', label: match[2] }
  if (match[3] !== undefined) return { shape: 'rect', label: match[3] }
  if (match[4] !== undefined) return { shape: 'round', label: match[4] }
  if (match[5] !== undefined) return { shape: 'diamond', label: match[5] }
  return { shape: 'rect' }
}

export function parseMermaid(source: string): MermaidGraph {
  const nodes = new Map<string, MermaidNode>()
  const edges: MermaidEdge[] = []
  let direction: MermaidDirection = 'TD'

  const upsert = (match: RegExpMatchArray): string => {
    const id = match[1] as string
    const { shape, label } = shapeOf(match)
    const variant = match[6]
    const existing = nodes.get(id)
    if (!existing) {
      nodes.set(id, { id, label: label ?? id, shape, ...(variant ? { variant } : {}) })
      return id
    }
    if (label !== undefined) {
      existing.label = label
      existing.shape = shape
    }
    if (variant) existing.variant = variant
    return id
  }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.split('%%')[0]?.trim() ?? ''
    if (!line) continue

    const header = line.match(HEADER)
    if (header) {
      direction = normalizeDirection(header[1] as string)
      continue
    }

    let rest = line
    let head = rest.match(NODE)
    if (!head) continue
    let from = upsert(head)
    rest = rest.slice(head[0].length)

    while (rest) {
      const connector = rest.match(CONNECTOR)
      if (!connector) break
      rest = rest.slice(connector[0].length)

      const target = rest.match(NODE)
      if (!target) break
      const to = upsert(target)
      rest = rest.slice(target[0].length)

      const operator = connector[1] as string
      edges.push({
        from,
        to,
        ...(connector[2] ? { label: connector[2].trim() } : {}),
        dashed: operator.startsWith('-.'),
        arrow: operator.endsWith('>'),
      })
      from = to
    }
    head = null
  }

  return { direction, nodes: [...nodes.values()], edges }
}
