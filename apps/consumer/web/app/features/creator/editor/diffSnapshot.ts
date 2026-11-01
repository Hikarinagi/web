import type { BackendEditorField, BackendEditorRef } from '~/features/creator/editor'
import type {
  Changeset,
  RelationAddOp,
  RelationRefValue,
  RelationUpdateOp,
  ScalarChangeOp,
} from './changeset'
import { relationRefValues, toRelationRows, type EditorRelationRow } from './relation'

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

function pickAttributes(
  attributes: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of keys) result[key] = attributes?.[key] ?? null
  return result
}

function sortedIds(values: RelationRefValue[]): number[] {
  return [...new Set(values.map(value => value.id))].sort((a, b) => a - b)
}

function sameRefSet(a: RelationRefValue[], b: RelationRefValue[]): boolean {
  return jsonEqual(sortedIds(a), sortedIds(b))
}

function diffRelation(
  field: BackendEditorField,
  baseValue: unknown,
  draftValue: unknown,
  changeset: Changeset,
): void {
  const attrs = field.attributes ?? []
  const attrNames = attrs.map(a => a.name)
  const refAttrs = field.ref_attributes ?? []
  const baseList = toRelationRows(baseValue)
  const draftList = toRelationRows(draftValue)

  if (field.row_identity) {
    const matchedBase = new Set<number>()
    const matchByDraft = new Map<number, number>()

    for (let draftIndex = 0; draftIndex < draftList.length; draftIndex++) {
      const relationId = draftList[draftIndex]!.relation_id
      if (relationId === undefined) continue
      const baseIndex = baseList.findIndex(
        (row, index) => !matchedBase.has(index) && row.relation_id === relationId,
      )
      if (baseIndex < 0) continue
      matchedBase.add(baseIndex)
      matchByDraft.set(draftIndex, baseIndex)
    }
    for (let draftIndex = 0; draftIndex < draftList.length; draftIndex++) {
      if (matchByDraft.has(draftIndex)) continue
      const draftRow = draftList[draftIndex]!
      const baseIndex = baseList.findIndex(
        (row, index) =>
          !matchedBase.has(index) &&
          row.target_id === draftRow.target_id &&
          sameRelationRow(
            row,
            draftRow,
            attrNames,
            refAttrs.map(attr => attr.name),
          ),
      )
      if (baseIndex < 0) continue
      matchedBase.add(baseIndex)
      matchByDraft.set(draftIndex, baseIndex)
    }
    for (let draftIndex = 0; draftIndex < draftList.length; draftIndex++) {
      if (matchByDraft.has(draftIndex)) continue
      const draftRow = draftList[draftIndex]!
      const baseIndex = baseList.findIndex(
        (row, index) => !matchedBase.has(index) && row.target_id === draftRow.target_id,
      )
      if (baseIndex < 0) continue
      matchedBase.add(baseIndex)
      matchByDraft.set(draftIndex, baseIndex)
    }

    for (let baseIndex = 0; baseIndex < baseList.length; baseIndex++) {
      if (matchedBase.has(baseIndex)) continue
      const row = baseList[baseIndex]!
      changeset.push({
        kind: 'relation_remove',
        relation: field.field,
        ...(row.relation_id !== undefined && { relation_id: row.relation_id }),
        target_id: row.target_id,
        target_name: row.target.name,
        target_cover: row.target.cover ?? undefined,
      })
    }
    for (let draftIndex = 0; draftIndex < draftList.length; draftIndex++) {
      const draftRow = draftList[draftIndex]!
      const baseIndex = matchByDraft.get(draftIndex)
      if (baseIndex === undefined) {
        pushRelationAdd(field, draftRow, changeset)
      } else {
        pushRelationUpdate(field, baseList[baseIndex]!, draftRow, changeset)
      }
    }
    return
  }

  const baseRows = new Map(baseList.map(row => [row.target_id, row]))
  const draftRows = new Map(draftList.map(row => [row.target_id, row]))

  for (const [id, draftRow] of draftRows) {
    const baseRow = baseRows.get(id)
    if (!baseRow) {
      pushRelationAdd(field, draftRow, changeset)
      continue
    }
    pushRelationUpdate(field, baseRow, draftRow, changeset)
  }

  for (const [id, baseRow] of baseRows) {
    if (!draftRows.has(id)) {
      changeset.push({
        kind: 'relation_remove',
        relation: field.field,
        target_id: id,
        target_name: baseRow.target.name,
        target_cover: baseRow.target.cover ?? undefined,
      })
    }
  }
}

function pushRelationAdd(
  field: BackendEditorField,
  row: EditorRelationRow,
  changeset: Changeset,
): void {
  const attrs = field.attributes ?? []
  const addOp: RelationAddOp = {
    kind: 'relation_add',
    relation: field.field,
    target_id: row.target_id,
    target_name: row.target.name,
    target_cover: row.target.cover ?? undefined,
  }
  if (attrs.length)
    addOp.attributes = pickAttributes(
      row.attributes,
      attrs.map(attr => attr.name),
    )
  const refAttributes: Record<string, RelationRefValue[]> = {}
  for (const refAttr of field.ref_attributes ?? []) {
    const values = relationRefValues(row, refAttr.name)
    if (values.length) refAttributes[refAttr.name] = values
  }
  if (Object.keys(refAttributes).length) addOp.ref_attributes = refAttributes
  changeset.push(addOp)
}

function pushRelationUpdate(
  field: BackendEditorField,
  baseRow: EditorRelationRow,
  draftRow: EditorRelationRow,
  changeset: Changeset,
): void {
  const changed: Record<string, { from: unknown; to: unknown }> = {}
  for (const attr of field.attributes ?? []) {
    if (!jsonEqual(baseRow.attributes?.[attr.name], draftRow.attributes?.[attr.name])) {
      changed[attr.name] = {
        from: baseRow.attributes?.[attr.name] ?? null,
        to: draftRow.attributes?.[attr.name] ?? null,
      }
    }
  }
  const refChanged: Record<string, { from: RelationRefValue[]; to: RelationRefValue[] }> = {}
  for (const refAttr of field.ref_attributes ?? []) {
    const from = relationRefValues(baseRow, refAttr.name)
    const to = relationRefValues(draftRow, refAttr.name)
    if (!sameRefSet(from, to)) refChanged[refAttr.name] = { from, to }
  }
  if (Object.keys(changed).length === 0 && Object.keys(refChanged).length === 0) return
  const updateOp: RelationUpdateOp = {
    kind: 'relation_update',
    relation: field.field,
    ...(baseRow.relation_id !== undefined && { relation_id: baseRow.relation_id }),
    target_id: draftRow.target_id,
    target_name: draftRow.target.name,
    target_cover: draftRow.target.cover ?? undefined,
    attributes: changed,
  }
  if (Object.keys(refChanged).length > 0) updateOp.ref_attributes = refChanged
  changeset.push(updateOp)
}

function sameRelationRow(
  a: EditorRelationRow,
  b: EditorRelationRow,
  attributes: string[],
  refAttributes: string[],
): boolean {
  for (const attr of attributes) {
    if (!jsonEqual(a.attributes[attr], b.attributes[attr])) return false
  }
  for (const attr of refAttributes) {
    if (!sameRefSet(relationRefValues(a, attr), relationRefValues(b, attr))) return false
  }
  return true
}

export function diffSnapshot(
  base: Record<string, unknown>,
  draft: Record<string, unknown>,
  fields: BackendEditorField[],
  refs: {
    initial?: Record<string, BackendEditorRef>
    current?: Record<string, BackendEditorRef>
  } = {},
): Changeset {
  const changeset: Changeset = []
  for (const field of fields) {
    if (field.kind === 'scalar') {
      if (jsonEqual(base[field.field], draft[field.field])) continue
      const op: ScalarChangeOp = {
        kind: 'scalar',
        field: field.field,
        from: base[field.field] ?? null,
        to: draft[field.field] ?? null,
      }
      if (field.value_type === 'ref') {
        op.value_type = 'ref'
        const fromEntity = refs.initial?.[field.field]
        const toEntity = refs.current?.[field.field]
        if (fromEntity) {
          op.from_name = fromEntity.name
          if (fromEntity.cover) op.from_cover = fromEntity.cover
        }
        if (toEntity) {
          op.to_name = toEntity.name
          if (toEntity.cover) op.to_cover = toEntity.cover
        }
      } else if (field.value_type === 'object[]') {
        op.value_type = 'object[]'
      }
      changeset.push(op)
      continue
    }
    diffRelation(field, base[field.field], draft[field.field], changeset)
  }
  return changeset
}
