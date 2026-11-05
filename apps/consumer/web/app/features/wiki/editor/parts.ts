import type { EditableEntry, EditorDraft, EntryStatement } from './draft'

type EntryType = EditableEntry['type']
type Property = EntryStatement['property']

export interface EditorPart {
  key: string
  label: string
}

export const GAME_PARTS: readonly EditorPart[] = [
  { key: 'basic', label: '基本资料' },
  { key: 'releases', label: '发行版本' },
  { key: 'cast', label: '出场角色' },
  { key: 'relations', label: '相关作品' },
  { key: 'images', label: '图片' },
]

export const SERIES_PARTS: readonly EditorPart[] = [
  { key: 'basic', label: '基本资料' },
  { key: 'volumes', label: '卷与出版版本' },
  { key: 'credits', label: '作者与制作信息' },
  { key: 'cast', label: '出场角色' },
  { key: 'relations', label: '相关作品' },
]

const RELATIONS: readonly Property[] = ['GAME_RELATION', 'SERIES_RELATION', 'ADAPTATION']

export function partOf(owner: EntryType, type: EntryType, property: Property): string {
  if (type === 'APPEARANCE') return 'cast'
  if (owner === 'GAME') {
    if (type === 'PRODUCT') return property === 'COVER' ? 'images' : 'releases'
    if (property === 'SAMPLE_IMAGE') return 'images'
    if (RELATIONS.includes(property) || property === 'CREDIT') return 'relations'
    return 'basic'
  }
  if (type === 'VOLUME' || type === 'BOOK') return 'volumes'
  if (property === 'CREDIT') return 'credits'
  if (RELATIONS.includes(property)) return 'relations'
  return 'basic'
}

export const ELSEWHERE: Partial<Record<EntryType, readonly Property[]>> = {
  GAME: ['SAMPLE_IMAGE', 'GAME_RELATION', 'ADAPTATION', 'CREDIT'],
  PRODUCT: ['COVER'],
  SERIES: ['SERIES_RELATION', 'ADAPTATION', 'CREDIT'],
  APPEARANCE: ['APPEARANCE_RELATION'],
}

export function changedParts(
  owner: EntryType,
  draft: EditorDraft,
  statements: Map<number, { entry: number; statement: EntryStatement }>,
  typeOf: (entry: number) => EntryType | undefined,
): Record<string, number> {
  const counts: Record<string, number> = {}
  const count = (entry: number, property: Property) => {
    const type = typeOf(entry)
    if (!type) return
    const part = partOf(owner, type, property)
    counts[part] = (counts[part] ?? 0) + 1
  }
  const existing = [
    ...Object.keys(draft.changed),
    ...Object.keys(draft.removed),
    ...Object.keys(draft.moved),
    ...Object.keys(draft.positions).filter(key => !(key in draft.changed)),
    ...draft.restored.map(String),
  ]
  for (const key of existing) {
    const found = statements.get(Number(key))
    if (found) count(found.entry, found.statement.property)
  }
  for (const item of draft.added) count(item.entry, item.property)
  return counts
}
