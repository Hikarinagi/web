import { GAME_PARTS, SERIES_PARTS, type EditorPart } from './parts'
import type { EditableEntry } from './draft'

const PANELS = ['protect', 'delete', 'dismiss', 'preview', 'undo', 'relation', 'same'] as const
export type EditorPanel = (typeof PANELS)[number]

export function partsOf(type: EditableEntry['type']): readonly EditorPart[] {
  if (type === 'GAME') return GAME_PARTS
  if (type === 'SERIES') return SERIES_PARTS
  return []
}

function panelOf(path: string[]) {
  const last = path.at(-1)
  const id = Number(last)
  if (last === 'dismiss' && path.at(-3) === 'suggestions' && Number.isInteger(Number(path.at(-2))))
    return { panel: 'dismiss' as const, param: Number(path.at(-2)), size: 3 }
  if (path.at(-2) === 'undo' && Number.isInteger(id))
    return { panel: 'undo' as const, param: id, size: 2 }
  const panel = PANELS.find(item => item === last && item !== 'dismiss' && item !== 'undo')
  return panel ? { panel, param: null, size: 1 } : { panel: null, param: null, size: 0 }
}

export function editorPath(type: EditableEntry['type'], path: string[]) {
  const { panel, param, size } = panelOf(path)
  const segments = size ? path.slice(0, -size) : path
  const parts = partsOf(type)
  const part = parts.find(item => item.key === segments[0])?.key ?? parts[0]?.key ?? null
  const selection = (part && segments[0] === part ? segments.slice(1) : [])
    .map(Number)
    .filter(Number.isInteger)
  return {
    part,
    selection,
    panel,
    suggestion: panel === 'dismiss' ? param : null,
    edit: panel === 'undo' ? param : null,
    segments,
  }
}
