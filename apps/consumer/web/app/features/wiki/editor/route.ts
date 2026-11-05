import { GAME_PARTS, SERIES_PARTS, type EditorPart } from './parts'
import type { EditableEntry } from './draft'

const PANELS = ['protect', 'delete', 'dismiss', 'preview'] as const
export type EditorPanel = (typeof PANELS)[number]

export function partsOf(type: EditableEntry['type']): readonly EditorPart[] {
  if (type === 'GAME') return GAME_PARTS
  if (type === 'SERIES') return SERIES_PARTS
  return []
}

export function editorPath(type: EditableEntry['type'], path: string[]) {
  const last = path.at(-1)
  const dismissing = last === 'dismiss' && path.at(-3) === 'suggestions'
  const panel = dismissing ? 'dismiss' : (PANELS.find(item => item === last) ?? null)
  const segments = dismissing ? path.slice(0, -3) : panel ? path.slice(0, -1) : path
  const suggestion = dismissing ? Number(path.at(-2)) : null
  const parts = partsOf(type)
  const part = parts.find(item => item.key === segments[0])?.key ?? parts[0]?.key ?? null
  const selection = (part && segments[0] === part ? segments.slice(1) : [])
    .map(Number)
    .filter(Number.isInteger)
  return {
    part,
    selection,
    panel: panel === 'dismiss' && !Number.isInteger(suggestion) ? null : panel,
    suggestion: Number.isInteger(suggestion) ? suggestion : null,
    segments,
  }
}
