import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
import { toRelationRows, type EditorRelationRow, type RelationRefValue } from './relation'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toRowRefValues(value: unknown): RelationRefValue[] {
  if (!Array.isArray(value)) return []
  const out: RelationRefValue[] = []
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.id !== 'number') continue
    out.push({
      id: entry.id,
      name: typeof entry.name === 'string' ? entry.name : '',
      cover: typeof entry.cover === 'string' ? entry.cover : null,
    })
  }
  return out
}

function toRowRefAttributes(
  refAttributes: unknown,
): Record<string, RelationRefValue[]> | undefined {
  if (!isRecord(refAttributes)) return undefined
  const out: Record<string, RelationRefValue[]> = {}
  for (const [key, value] of Object.entries(refAttributes)) out[key] = toRowRefValues(value)
  return out
}

function applyRelationUpdate(
  row: EditorRelationRow,
  attributes: unknown,
  refAttributes: unknown,
): EditorRelationRow {
  let result = row
  if (isRecord(attributes)) {
    const next = { ...row.attributes }
    for (const [key, change] of Object.entries(attributes)) {
      if (isRecord(change) && 'to' in change) next[key] = change.to
    }
    result = { ...result, attributes: next }
  }
  if (isRecord(refAttributes)) {
    const nextRefs = { ...(result.ref_attributes ?? {}) }
    for (const [key, change] of Object.entries(refAttributes)) {
      if (!isRecord(change) || !('to' in change)) continue
      // 后端 snapshot-diff(回滚/版本)产出的 ref 值只带 id,缺 name/cover;
      // 用基线行已有的摘要补全,避免续编/审阅里声优显示成 #id。
      const priorById = new Map((result.ref_attributes?.[key] ?? []).map(v => [v.id, v]))
      nextRefs[key] = toRowRefValues(change.to).map(v =>
        v.name || v.cover ? v : (priorById.get(v.id) ?? v),
      )
    }
    result = { ...result, ref_attributes: nextRefs }
  }
  return result
}

export function applyChangeset(
  base: Record<string, unknown>,
  payload: BackendChangeRequestDetail['payload'],
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base }
  for (const op of payload ?? []) {
    const entry = op as {
      kind?: unknown
      field?: unknown
      to?: unknown
      relation?: unknown
      relation_id?: unknown
      target_id?: unknown
      target_name?: unknown
      target_cover?: unknown
      attributes?: unknown
      ref_attributes?: unknown
    }

    if (entry.kind === 'scalar' && typeof entry.field === 'string') {
      result[entry.field] = entry.to ?? null
      continue
    }

    if (typeof entry.relation !== 'string' || typeof entry.target_id !== 'number') continue
    const rows = toRelationRows(result[entry.relation])
    const relationId = typeof entry.relation_id === 'number' ? entry.relation_id : undefined

    if (entry.kind === 'relation_add') {
      const row: EditorRelationRow = {
        target_id: entry.target_id,
        target: {
          name: typeof entry.target_name === 'string' ? entry.target_name : '',
          cover: typeof entry.target_cover === 'string' ? entry.target_cover : null,
        },
        attributes: isRecord(entry.attributes) ? { ...entry.attributes } : {},
      }
      const refAttributes = toRowRefAttributes(entry.ref_attributes)
      if (refAttributes) row.ref_attributes = refAttributes
      result[entry.relation] = [...rows, row]
    } else if (entry.kind === 'relation_remove') {
      result[entry.relation] = rows.filter(row =>
        relationId !== undefined
          ? row.relation_id !== relationId || row.target_id !== entry.target_id
          : row.target_id !== entry.target_id,
      )
    } else if (entry.kind === 'relation_update') {
      let index =
        relationId !== undefined
          ? rows.findIndex(
              row => row.relation_id === relationId && row.target_id === entry.target_id,
            )
          : rows.findIndex(row => {
              if (row.target_id !== entry.target_id || !isRecord(entry.attributes)) return false
              return Object.entries(entry.attributes).every(
                ([key, change]) =>
                  isRecord(change) &&
                  'from' in change &&
                  JSON.stringify(row.attributes[key] ?? null) ===
                    JSON.stringify(change.from ?? null),
              )
            })
      if (index < 0 && relationId === undefined) {
        index = rows.findIndex(row => row.target_id === entry.target_id)
      }
      result[entry.relation] = rows.map((row, rowIndex) =>
        rowIndex === index ? applyRelationUpdate(row, entry.attributes, entry.ref_attributes) : row,
      )
    }
  }
  return result
}
