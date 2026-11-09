import type { ValueDraft } from './draft'
import type { WorkingValue } from './working'

export type RelationSide = 'held' | 'given'
type Target = NonNullable<ValueDraft['target']>
type Period = Pick<
  ValueDraft,
  'period_from' | 'period_from_precision' | 'period_to' | 'period_to_precision'
>

export interface RelationRow {
  key: string
  side: RelationSide
  holder: number
  id: number
  other: Target
  code: string | null
  period: Period
  state: 'same' | 'changed' | 'added' | 'removed' | 'flipped'
  undo: number[]
}

export interface IncomingRelation extends Period {
  statement_id: number
  code: string | null
  entry: Target
}

const periodOf = (value: Period): Period => ({
  period_from: value.period_from,
  period_from_precision: value.period_from_precision,
  period_to: value.period_to,
  period_to_precision: value.period_to_precision,
})

const STATES: Partial<Record<WorkingValue['state'], RelationRow['state']>> = {
  same: 'same',
  restored: 'same',
  changed: 'changed',
  added: 'added',
  removed: 'removed',
}

export function relationRows(
  root: Target,
  held: WorkingValue[],
  incoming: IncomingRelation[],
  borrowed: Map<number, { entry: Target; values: WorkingValue[] }>,
): RelationRow[] {
  const rows: RelationRow[] = []
  const push = (side: RelationSide, holder: Target, value: WorkingValue) => {
    const state = STATES[value.state]
    const other = side === 'held' ? value.value.target : holder
    if (!state || !other) return
    rows.push({
      key: `${holder.id}:${value.id}`,
      side,
      holder: holder.id,
      id: value.id,
      other,
      code: value.value.code,
      period: periodOf(value.value),
      state,
      undo: state === 'same' ? [] : [value.id],
    })
  }
  for (const value of held) push('held', root, value)
  for (const item of incoming) {
    const values = borrowed.get(item.entry.id)?.values
    if (!values) {
      rows.push({
        key: `${item.entry.id}:${item.statement_id}`,
        side: 'given',
        holder: item.entry.id,
        id: item.statement_id,
        other: item.entry,
        code: item.code,
        period: periodOf(item),
        state: 'same',
        undo: [],
      })
      continue
    }
    const value = values.find(entry => entry.id === item.statement_id)
    if (value?.value.target?.id === root.id) push('given', item.entry, value)
  }
  for (const { entry, values } of borrowed.values())
    for (const value of values)
      if (value.id < 0 && value.value.target?.id === root.id) push('given', entry, value)
  return rows.flatMap(row => {
    if (row.state === 'removed') {
      const flip = rows.find(
        item => item.state === 'added' && item.other.id === row.other.id && item.side !== row.side,
      )
      return flip ? [] : [row]
    }
    if (row.state !== 'added') return [row]
    const was = rows.find(
      item => item.state === 'removed' && item.other.id === row.other.id && item.side !== row.side,
    )
    return [was ? { ...row, state: 'flipped' as const, undo: [row.id, was.id] } : row]
  })
}
