import type { ApiData, components } from '@hikarinagi/api-contract/v3'

export type EditableEntry = ApiData<'/api/v3/wiki/entries/{id}', 'get'>
export type EntryStatement = EditableEntry['statements'][number]
export type EditOperation = components['schemas']['EditOperationDto']
export type DeprecationReason = NonNullable<EditOperation['reason']>
export type PropertyDefinition = components['schemas']['PropertyDefinitionDto']
export type EntryDefinition = components['schemas']['EntryDefinitionDto']
type EntryType = EditableEntry['type']
type Property = EntryStatement['property']

const VALUE_FIELDS = [
  'value_kind',
  'text',
  'reading',
  'original',
  'code',
  'role',
  'song',
  'song_kind',
  'date',
  'date_precision',
  'amount',
  'currency',
  'tax_included',
  'number',
  'archive_url',
] as const

const QUALIFIER_FIELDS = [
  'period_from',
  'period_from_precision',
  'period_to',
  'period_to_precision',
  'part',
  'language',
] as const

export type ValueDraft = Pick<
  EntryStatement,
  | (typeof VALUE_FIELDS)[number]
  | (typeof QUALIFIER_FIELDS)[number]
  | 'target'
  | 'media'
  | 'versions'
>

export interface AddedValue {
  id: number
  entry: number
  property: Property
  value: ValueDraft
}

export interface EditorDraft {
  base: Record<number, number>
  created: { id: number; type: EntryType }[]
  added: AddedValue[]
  changed: Record<number, ValueDraft>
  removed: Record<number, DeprecationReason | null>
  restored: number[]
  moved: Record<number, number>
  positions: Record<number, number>
  rated: Record<number, { sexual: number; violence: number }>
  detached: number[]
  note: string
  basis: { url: string; media: NonNullable<ValueDraft['media']>[] }
}

export function emptyDraft(): EditorDraft {
  return {
    base: {},
    created: [],
    added: [],
    changed: {},
    removed: {},
    restored: [],
    moved: {},
    positions: {},
    rated: {},
    detached: [],
    note: '',
    basis: { url: '', media: [] },
  }
}

export function emptyValue(): ValueDraft {
  return {
    value_kind: 'VALUE',
    text: null,
    reading: null,
    original: null,
    code: null,
    role: null,
    song: null,
    song_kind: null,
    date: null,
    date_precision: null,
    amount: null,
    currency: null,
    tax_included: null,
    number: null,
    archive_url: null,
    period_from: null,
    period_from_precision: null,
    period_to: null,
    period_to_precision: null,
    part: null,
    language: null,
    target: null,
    media: null,
    versions: [],
  }
}

export function entryState(
  draft: EditorDraft,
  owner: (statement: number) => number | undefined,
  id: number,
): 'created' | 'changed' | null {
  if (draft.created.some(entry => entry.id === id)) return 'created'
  const touched = [draft.changed, draft.removed, draft.moved, draft.positions]
    .flatMap(record => Object.keys(record).map(Number))
    .concat(draft.restored)
  return draft.added.some(item => item.entry === id) ||
    draft.detached.includes(id) ||
    touched.some(statement => owner(statement) === id)
    ? 'changed'
    : null
}

export function isBlank(value: ValueDraft): boolean {
  return (
    value.value_kind === 'VALUE' &&
    [value.text, value.code, value.date, value.amount, value.number].every(blank) &&
    !value.target &&
    !value.media
  )
}

export function valueOf(statement: Omit<EntryStatement, 'editor'>): ValueDraft {
  const value = emptyValue()
  for (const field of [...VALUE_FIELDS, ...QUALIFIER_FIELDS])
    Object.assign(value, { [field]: statement[field] })
  return {
    ...value,
    target: statement.target,
    media: statement.media,
    versions: statement.versions,
  }
}

const trimmed = (value: unknown) => (typeof value === 'string' ? value.trim() : value)
const blank = (value: unknown) => value === null || value === undefined || trimmed(value) === ''

function same(a: unknown, b: unknown): boolean {
  return (blank(a) && blank(b)) || trimmed(a) === trimmed(b)
}

function changedFields(before: ValueDraft, after: ValueDraft) {
  const value = VALUE_FIELDS.filter(field => !same(before[field], after[field]))
  const qualifiers = QUALIFIER_FIELDS.filter(field => !same(before[field], after[field]))
  return {
    value,
    qualifiers,
    target: (before.target?.id ?? null) !== (after.target?.id ?? null),
    media: (before.media?.id ?? null) !== (after.media?.id ?? null),
    versions:
      before.versions.map(item => item.id).join(',') !==
      after.versions.map(item => item.id).join(','),
  }
}

export function sameValue(before: ValueDraft, after: ValueDraft): boolean {
  const diff = changedFields(before, after)
  return (
    !diff.value.length && !diff.qualifiers.length && !diff.target && !diff.media && !diff.versions
  )
}

const refKey = (id: number) => `n${-id}`

function targetInput(target: ValueDraft['target']) {
  if (!target) return { target: null }
  return target.id < 0 ? { target_ref: refKey(target.id) } : { target: target.id }
}

function versionsInput(versions: ValueDraft['versions']) {
  const ids = versions.filter(item => item.id > 0).map(item => item.id)
  const refs = versions.filter(item => item.id < 0).map(item => refKey(item.id))
  return { versions: ids, ...(refs.length ? { version_refs: refs } : {}) }
}

const clean = (value: unknown) => (blank(value) ? null : trimmed(value))

function valueInput(value: ValueDraft, fields: readonly (typeof VALUE_FIELDS)[number][]) {
  return Object.fromEntries(fields.map(field => [field, clean(value[field])]))
}

function qualifierInput(value: ValueDraft, fields: readonly (typeof QUALIFIER_FIELDS)[number][]) {
  return Object.fromEntries(fields.map(field => [field, clean(value[field])]))
}

export function changeCount(draft: EditorDraft): number {
  return (
    draft.created.filter(entry => entry.type !== 'CHARACTER').length +
    draft.added.filter(item => !draft.created.some(entry => entry.id === item.entry)).length +
    Object.keys(draft.changed).length +
    Object.keys(draft.removed).length +
    draft.restored.length +
    Object.keys(draft.moved).length +
    Object.keys(draft.positions).filter(key => !(key in draft.changed)).length +
    Object.keys(draft.rated).length +
    draft.detached.length
  )
}

export function operationsOf(
  draft: EditorDraft,
  statements: Map<number, { entry: number; statement: EntryStatement }>,
) {
  const operations: EditOperation[] = draft.created.map(entry => ({
    op: 'create_entry',
    ref: refKey(entry.id),
    type: entry.type,
  }))
  for (const item of draft.added) {
    operations.push({
      op: 'add',
      ...(item.entry < 0 ? { entry_ref: refKey(item.entry) } : { entry: item.entry }),
      property: item.property,
      value: {
        ...valueInput(item.value, VALUE_FIELDS),
        ...targetInput(item.value.target),
        media_id: item.value.media?.id ?? null,
      },
      qualifiers: {
        ...qualifierInput(item.value, QUALIFIER_FIELDS),
        ...versionsInput(item.value.versions),
      },
    })
  }
  const touched = new Set([...Object.keys(draft.changed), ...Object.keys(draft.positions)])
  for (const key of touched) {
    const statement = statements.get(Number(key))?.statement
    if (!statement) continue
    const after = draft.changed[statement.id] ?? valueOf(statement)
    const position = draft.positions[statement.id]
    const diff = changedFields(valueOf(statement), after)
    const value = {
      ...valueInput(after, diff.value),
      ...(diff.target ? targetInput(after.target) : {}),
      ...(diff.media ? { media_id: after.media?.id ?? null } : {}),
    }
    const qualifiers = {
      ...qualifierInput(after, diff.qualifiers),
      ...(diff.versions ? versionsInput(after.versions) : {}),
    }
    const moved = position !== undefined && position !== statement.position
    if (!Object.keys(value).length && !Object.keys(qualifiers).length && !moved) continue
    operations.push({
      op: 'modify',
      statement: statement.id,
      ...(Object.keys(value).length ? { value } : {}),
      ...(Object.keys(qualifiers).length ? { qualifiers } : {}),
      ...(moved ? { position } : {}),
    })
  }
  for (const [key, reason] of Object.entries(draft.removed))
    if (reason) operations.push({ op: 'deprecate', statement: Number(key), reason })
  for (const id of draft.restored) operations.push({ op: 'restore', statement: id })
  for (const [key, target] of Object.entries(draft.moved))
    operations.push({
      op: 'move',
      statement: Number(key),
      ...(target < 0 ? { target_ref: refKey(target) } : { target }),
    })
  for (const [key, rating] of Object.entries(draft.rated))
    operations.push({ op: 'rate', media: Number(key), ...rating })
  for (const entry of draft.detached) operations.push({ op: 'detach', entry })
  return operations
}
