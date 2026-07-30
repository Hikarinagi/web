import type { BackendEditorField, BackendEditorSchema } from '~/features/creator/editor'
import { buildFieldValidator, isValidationValueType, VALIDATION_MESSAGES } from '@hikarinagi/shared'
import * as v from 'valibot'
import type { EditorFieldPresentation } from './presentation'

function fieldSchema(field: BackendEditorField, valueType: string): v.GenericSchema | null {
  const normalized = valueType === 'ref' ? 'int' : valueType
  if (!isValidationValueType(normalized)) return null
  const base = buildFieldValidator(
    {
      required: field.required ?? false,
      min_length: field.min_length,
      max_length: field.max_length,
      min: field.min,
      max: field.max,
      pattern: field.pattern,
      pattern_message: field.pattern_message,
    },
    {
      value_type: normalized,
      nullable: field.nullable,
      enum_values: field.enum_values,
    },
  )
  if (field.field === 'prices' && valueType === 'object[]') {
    return v.pipe(
      base,
      v.check(value => {
        if (!Array.isArray(value)) return true
        for (const row of value) {
          if (!row || typeof row !== 'object') return false
          const r = row as { amount?: unknown; currency?: unknown }
          if (typeof r.amount !== 'number' || !Number.isFinite(r.amount)) return false
          if (typeof r.currency !== 'string' || r.currency.trim() === '') return false
        }
        return true
      }, '每行的金额、币种均为必填'),
      v.check(value => {
        if (!Array.isArray(value)) return true
        const seen = new Set<string>()
        for (const row of value) {
          if (!row || typeof row !== 'object') continue
          const key =
            typeof (row as { version?: unknown }).version === 'string'
              ? (row as { version: string }).version.trim()
              : ''
          if (!key) continue
          if (seen.has(key)) return false
          seen.add(key)
        }
        return true
      }, '版本名称不能重复'),
      v.check(value => {
        if (!Array.isArray(value)) return true
        for (const row of value) {
          if (!row || typeof row !== 'object') continue
          const amount = (row as { amount?: unknown }).amount
          if (typeof amount === 'number' && amount < 0) return false
        }
        return true
      }, '金额不能为负数'),
    )
  }
  if (field.field === 'labels' && valueType === 'object[]') {
    return v.pipe(
      base,
      v.check(value => {
        if (!Array.isArray(value)) return true
        for (const row of value) {
          if (!row || typeof row !== 'object') return false
          const key =
            typeof (row as { key?: unknown }).key === 'string'
              ? (row as { key: string }).key.trim()
              : ''
          if (!key) return false
        }
        return true
      }, '每一项的字段名均为必填'),
      v.check(value => {
        if (!Array.isArray(value)) return true
        for (const row of value) {
          if (!row || typeof row !== 'object') return false
          const val =
            typeof (row as { value?: unknown }).value === 'string'
              ? (row as { value: string }).value.trim()
              : ''
          if (!val) return false
        }
        return true
      }, '每一项的内容均为必填'),
      v.check(value => {
        if (!Array.isArray(value)) return true
        const seen = new Set<string>()
        for (const row of value) {
          if (!row || typeof row !== 'object') continue
          const key =
            typeof (row as { key?: unknown }).key === 'string'
              ? (row as { key: string }).key.trim()
              : ''
          if (!key) continue
          if (seen.has(key)) return false
          seen.add(key)
        }
        return true
      }, '字段名不能重复'),
    )
  }
  return base
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function schemaToValibot(
  schema: BackendEditorSchema,
  presentation: Record<string, EditorFieldPresentation> = {},
) {
  const entries: Record<string, v.GenericSchema> = {}
  for (const field of schema.fields) {
    if (field.kind !== 'scalar') continue
    const built = fieldSchema(field, field.value_type ?? 'string')
    if (!built) continue
    entries[field.field] = field.required === true ? built : v.optional(built)
  }

  const conditional = schema.fields
    .filter(field => field.kind === 'scalar' && presentation[field.field]?.requireWhen)
    .map(field => ({
      field: field.field,
      requireWhen: presentation[field.field]!.requireWhen!,
    }))

  const baseSchema = v.object(entries)
  if (!conditional.length) return baseSchema

  return conditional.reduce<v.GenericSchema>((schema, { field, requireWhen }) => {
    const guard = v.forward(
      v.check(
        (input: Record<string, unknown>) => !requireWhen(input) || !isEmpty(input[field]),
        VALIDATION_MESSAGES.required,
      ),
      [field],
    )
    return v.pipe(schema as v.GenericSchema<Record<string, unknown>>, guard) as v.GenericSchema
  }, baseSchema)
}
