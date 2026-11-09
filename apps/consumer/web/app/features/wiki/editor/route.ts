import type { LocationQuery } from 'vue-router'
import { GAME_PARTS, SERIES_PARTS, type EditorPart } from './parts'
import type { EditableEntry } from './draft'

const PANELS = ['protect', 'delete', 'dismiss', 'preview', 'undo', 'relation', 'same'] as const
export type EditorPanel = (typeof PANELS)[number]

export function partsOf(type: EditableEntry['type']): readonly EditorPart[] {
  if (type === 'GAME') return GAME_PARTS
  if (type === 'SERIES') return SERIES_PARTS
  return []
}

function single(value: LocationQuery[string] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : null
}

function idOf(value: LocationQuery[string] | undefined) {
  const id = Number(single(value))
  return Number.isInteger(id) && id > 0 ? id : null
}

export function editorPath(type: EditableEntry['type'], segments: string[], query: LocationQuery) {
  const parts = partsOf(type)
  const part = parts.find(item => item.key === segments[0])?.key ?? parts[0]?.key ?? null
  const selection = (part && segments[0] === part ? segments.slice(1) : [])
    .map(Number)
    .filter(Number.isInteger)
  const panel = PANELS.find(item => item === single(query.panel)) ?? null
  return {
    part,
    selection,
    panel,
    suggestion: panel === 'dismiss' ? idOf(query.hint) : null,
    edit: panel === 'undo' ? idOf(query.edit) : null,
    segments,
  }
}
