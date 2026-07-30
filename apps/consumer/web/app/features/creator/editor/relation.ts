import type { InjectionKey, Ref } from 'vue'

export const IN_ENTITY_DRAWER_KEY: InjectionKey<boolean> = Symbol('hikari-in-entity-drawer')

export const ENTITY_DRAWER_FOOTER_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol(
  'hikari-entity-drawer-footer',
)

export interface RelationTargetSummary {
  name: string
  cover: string | null
}

export interface RelationRefValue {
  id: number
  name: string
  cover: string | null
}

export interface EditorRelationRow {
  target_id: number
  target: RelationTargetSummary
  attributes: Record<string, unknown>
  ref_attributes?: Record<string, RelationRefValue[]>
}

export function toRelationRows(value: unknown): EditorRelationRow[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (row): row is EditorRelationRow =>
      typeof row === 'object' &&
      row !== null &&
      typeof (row as EditorRelationRow).target_id === 'number',
  )
}

export function relationRefValues(
  row: EditorRelationRow | undefined,
  name: string,
): RelationRefValue[] {
  const values = row?.ref_attributes?.[name]
  return Array.isArray(values) ? values : []
}
