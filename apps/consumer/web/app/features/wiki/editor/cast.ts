import type { EntryEditor } from '~/features/wiki/composables/useEntryEditor'
import { emptyValue } from './draft'

export type CastGroup = 'capturable' | 'protagonist' | 'main' | 'supporting' | 'cameo' | 'none'

export interface CastFacts {
  id: number
  role: string | null
  protagonist: boolean
  capturable: boolean
  order: number | null
  before: number | null
}

const GROUPS: { key: CastGroup; game: string; series: string }[] = [
  { key: 'capturable', game: '可攻略', series: '' },
  { key: 'protagonist', game: '主人公', series: '' },
  { key: 'main', game: '其他主角', series: '主角' },
  { key: 'supporting', game: '配角', series: '配角' },
  { key: 'cameo', game: '客串', series: '客串' },
  { key: 'none', game: '定位未记录', series: '定位未记录' },
]

const ROLE_GROUPS: Record<string, CastGroup> = {
  MAIN: 'main',
  SUPPORTING: 'supporting',
  CAMEO: 'cameo',
}

export function castGroupOf(facts: CastFacts, game: boolean): CastGroup {
  if (game && facts.capturable) return 'capturable'
  if (game && facts.protagonist) return 'protagonist'
  return (facts.role && ROLE_GROUPS[facts.role]) || 'none'
}

export function castFacts(editor: EntryEditor, id: number): CastFacts {
  const general = (property: 'CAST_ROLE' | 'PROTAGONIST' | 'CAPTURABLE' | 'ORDER') =>
    editor
      .property(id, property)
      .values.find(
        item =>
          item.state !== 'removed' && item.state !== 'moved_out' && !item.value.versions.length,
      )?.value ?? null
  const original = editor.entries.value
    .get(id)
    ?.statements.find(
      item => item.property === 'ORDER' && item.status !== 'DEPRECATED' && !item.versions.length,
    )
  return {
    id,
    role: general('CAST_ROLE')?.code ?? null,
    protagonist: general('PROTAGONIST')?.code === 'YES',
    capturable: general('CAPTURABLE')?.code === 'YES',
    order: general('ORDER')?.number ?? null,
    before: original?.number ?? null,
  }
}

export function placeCast(editor: EntryEditor, ids: number[]) {
  ids.forEach((id, index) => {
    const current = editor
      .property(id, 'ORDER')
      .values.find(
        item =>
          item.state !== 'removed' && item.state !== 'moved_out' && !item.value.versions.length,
      )
    if (current?.value.number === index + 1) return
    if (current) editor.set(current.id, { ...current.value, number: index + 1 })
    else editor.add(id, 'ORDER', { ...emptyValue(), number: index + 1 })
  })
}

export function castGroups(rows: CastFacts[], game: boolean, by: 'order' | 'before' = 'order') {
  const rank = (row: CastFacts) => row[by] ?? Number.POSITIVE_INFINITY
  const sequence = new Map(rows.map((row, index) => [row.id, index]))
  return GROUPS.flatMap(group => {
    const ids = rows
      .filter(row => castGroupOf(row, game) === group.key)
      .sort((a, b) => rank(a) - rank(b) || sequence.get(a.id)! - sequence.get(b.id)!)
      .map(row => row.id)
    return ids.length ? [{ key: group.key, title: game ? group.game : group.series, ids }] : []
  })
}
