import { WIKI_PERMISSIONS, type PermissionCheck } from '@hikarinagi/shared'

export interface ScalarChangeOp {
  kind: 'scalar'
  field: string
  from: unknown
  to: unknown
  value_type?: string
  from_name?: string
  from_cover?: string
  to_name?: string
  to_cover?: string
}

export interface RelationRefValue {
  id: number
  name?: string
  cover?: string | null
}

export interface RelationAddOp {
  kind: 'relation_add'
  relation: string
  target_id: number
  target_name?: string
  target_cover?: string
  attributes?: Record<string, unknown>
  ref_attributes?: Record<string, RelationRefValue[]>
}

export interface RelationRemoveOp {
  kind: 'relation_remove'
  relation: string
  target_id: number
  target_name?: string
  target_cover?: string
}

export interface RelationUpdateOp {
  kind: 'relation_update'
  relation: string
  target_id: number
  target_name?: string
  target_cover?: string
  attributes: Record<string, { from: unknown; to: unknown }>
  ref_attributes?: Record<string, { from: RelationRefValue[]; to: RelationRefValue[] }>
}

export type RelationChangeOp = RelationAddOp | RelationRemoveOp | RelationUpdateOp

export type ChangesetOp = ScalarChangeOp | RelationChangeOp

export type Changeset = ChangesetOp[]

export function needsReviewFor(
  changeset: Changeset,
  fields: readonly { field: string; scope: string }[],
  can: (permission: PermissionCheck) => boolean,
): boolean {
  const scopeByField = new Map(fields.map(field => [field.field, field.scope]))
  const scopes = new Set<string>()
  for (const op of changeset) {
    const scope = scopeByField.get(op.kind === 'scalar' ? op.field : op.relation)
    if (scope) scopes.add(scope)
  }
  return [...scopes].some(scope => !can(`${WIKI_PERMISSIONS.COMMIT}.${scope}`))
}
