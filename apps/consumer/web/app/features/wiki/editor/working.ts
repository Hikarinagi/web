import {
  sameValue,
  valueOf,
  type DeprecationReason,
  type EditableEntry,
  type EditorDraft,
  type EntryStatement,
  type ValueDraft,
} from './draft'

type Property = EntryStatement['property']

export type ValueState =
  'same' | 'changed' | 'added' | 'removed' | 'restored' | 'moved_in' | 'moved_out'

export interface WorkingValue {
  id: number
  property: Property
  value: ValueDraft
  before: ValueDraft | null
  state: ValueState
  reason: DeprecationReason | null
  moved: number | null
}

export interface WorkingProperty {
  values: WorkingValue[]
  deprecated: EntryStatement[]
}

export function propertyOf(
  entry: Pick<EditableEntry, 'id' | 'statements'> | null,
  entryId: number,
  property: Property,
  draft: EditorDraft,
  statements: Map<number, { entry: number; statement: EntryStatement }>,
): WorkingProperty {
  const own = (entry?.statements ?? []).filter(item => item.property === property)
  const incoming = Object.entries(draft.moved).flatMap(([key, target]) => {
    const found = statements.get(Number(key))
    return target === entryId && found?.statement.property === property && found.entry !== entryId
      ? [found.statement]
      : []
  })
  const live = [...own, ...incoming]
    .filter(item => item.status !== 'DEPRECATED' || draft.restored.includes(item.id))
    .sort(
      (a, b) =>
        (draft.positions[a.id] ?? a.position) - (draft.positions[b.id] ?? b.position) ||
        a.id - b.id,
    )
  const values: WorkingValue[] = live.map(statement => {
    const base = valueOf(statement)
    const value = draft.changed[statement.id] ?? base
    const moved = draft.moved[statement.id] ?? null
    const removed = statement.id in draft.removed
    const state: ValueState = removed
      ? 'removed'
      : moved !== null
        ? moved === entryId
          ? 'moved_in'
          : 'moved_out'
        : draft.restored.includes(statement.id)
          ? 'restored'
          : sameValue(base, value)
            ? 'same'
            : 'changed'
    return {
      id: statement.id,
      property,
      value,
      before: state === 'same' ? null : base,
      state,
      reason: removed ? (draft.removed[statement.id] ?? null) : null,
      moved,
    }
  })
  for (const item of draft.added)
    if (item.entry === entryId && item.property === property)
      values.push({
        id: item.id,
        property,
        value: item.value,
        before: null,
        state: 'added',
        reason: null,
        moved: null,
      })
  return {
    values,
    deprecated: own.filter(
      item => item.status === 'DEPRECATED' && !draft.restored.includes(item.id),
    ),
  }
}
