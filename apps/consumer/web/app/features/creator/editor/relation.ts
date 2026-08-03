import type { components } from '@hikarinagi/api-contract/v3'
import type { InjectionKey, Ref } from 'vue'

type Schemas = components['schemas']

export const IN_ENTITY_DRAWER_KEY: InjectionKey<boolean> = Symbol('hikari-in-entity-drawer')

export const ENTITY_DRAWER_FOOTER_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol(
  'hikari-entity-drawer-footer',
)

export type RelationTargetSummary = Schemas['EntityRefSummaryDto']
export type RelationRefValue = Schemas['EditorRelationRefValueDto']
export type EditorRelationRow = Schemas['EditorRelationRowDto']

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
