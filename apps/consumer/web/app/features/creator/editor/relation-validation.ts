import { buildFieldValidator, hasFieldRules, type ValidationRules } from '@hikarinagi/shared'
import * as v from 'valibot'
import type { BackendEditorField } from '~/features/creator/editor'
import type { EditorRelationRow } from './relation'

function relationRules(field: BackendEditorField): ValidationRules {
  return {
    required: field.required ?? false,
    min_length: field.min_length,
    max_length: field.max_length,
  }
}

function missingRelationType(field: BackendEditorField, rows: EditorRelationRow[]): boolean {
  if (!field.attributes?.some(attr => attr.name === 'relation')) return false
  return rows.some(row => {
    const value = row.attributes.relation
    return typeof value !== 'string' || value.length === 0
  })
}

export function validateRelations(
  fields: readonly BackendEditorField[],
  relations: Record<string, EditorRelationRow[]>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    if (field.kind !== 'relation') continue
    const rows = relations[field.field] ?? []

    const rules = relationRules(field)
    if (hasFieldRules(rules)) {
      const schema = buildFieldValidator(rules, { value_type: 'object[]', nullable: false })
      const result = v.safeParse(schema, rows)
      if (!result.success && result.issues[0]) {
        errors[field.field] = result.issues[0].message
        continue
      }
    }

    if (missingRelationType(field, rows)) {
      errors[field.field] = '有关联作品未选择「关系类型」,请补全后再提交'
    }
  }
  return errors
}
