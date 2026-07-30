import type { BackendEditorField, BackendEditorRef } from '~/features/creator/editor'
import type {
  Changeset,
  RelationAddOp,
  RelationRefValue,
  RelationUpdateOp,
  ScalarChangeOp,
} from './changeset'
import { relationRefValues, toRelationRows } from './relation'

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
  const baseRows = new Map(toRelationRows(baseValue).map(row => [row.target_id, row]))
  const draftRows = new Map(toRelationRows(draftValue).map(row => [row.target_id, row]))

  for (const [id, draftRow] of draftRows) {
    const baseRow = baseRows.get(id)
    if (!baseRow) {
      const addOp: RelationAddOp = {
        kind: 'relation_add',
        relation: field.field,
        target_id: id,
        target_name: draftRow.target.name,
        target_cover: draftRow.target.cover ?? undefined,
      }
      if (attrs.length) addOp.attributes = pickAttributes(draftRow.attributes, attrNames)
      const refAttributes: Record<string, RelationRefValue[]> = {}
      for (const refAttr of refAttrs) {
        const values = relationRefValues(draftRow, refAttr.name)
        if (values.length) refAttributes[refAttr.name] = values
      }
      if (Object.keys(refAttributes).length) addOp.ref_attributes = refAttributes
      changeset.push(addOp)
      continue
    }

    const changed: Record<string, { from: unknown; to: unknown }> = {}
    for (const attr of attrNames) {
      if (!jsonEqual(baseRow.attributes?.[attr], draftRow.attributes?.[attr])) {
        changed[attr] = {
          from: baseRow.attributes?.[attr] ?? null,
          to: draftRow.attributes?.[attr] ?? null,
        }
      }
    }
    const refChanged: Record<string, { from: RelationRefValue[]; to: RelationRefValue[] }> = {}
    for (const refAttr of refAttrs) {
      const from = relationRefValues(baseRow, refAttr.name)
      const to = relationRefValues(draftRow, refAttr.name)
      if (!sameRefSet(from, to)) refChanged[refAttr.name] = { from, to }
    }
    if (Object.keys(changed).length > 0 || Object.keys(refChanged).length > 0) {
      const updateOp: RelationUpdateOp = {
        kind: 'relation_update',
        relation: field.field,
        target_id: id,
        target_name: draftRow.target.name,
        target_cover: draftRow.target.cover ?? undefined,
        attributes: changed,
      }
      if (Object.keys(refChanged).length > 0) updateOp.ref_attributes = refChanged
      changeset.push(updateOp)
    }
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
