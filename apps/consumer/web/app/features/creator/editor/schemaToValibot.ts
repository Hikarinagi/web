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
  if ((field.field === 'editions' || field.field === 'variants') && valueType === 'object[]') {
    const editions = field.field === 'editions'
    const rows = (value: unknown) =>
      (Array.isArray(value) ? value : []).filter(
        (row): row is Record<string, unknown> => !!row && typeof row === 'object',
      )
    const priceKey = editions ? 'price' : 'price_amount'
    const currencyKey = editions ? 'currency' : 'price_currency'
    return v.pipe(
      base,
      v.check(
        value =>
          rows(value).every(row =>
            editions
              ? !!(typeof row.title === 'string' && row.title.trim()) ||
                !!row.kind ||
                row.price != null ||
                row.jan != null
              : typeof row.title === 'string' && row.title.trim() !== '',
          ),
        editions ? '每个版本都需要名称或类型。' : '每个特装版都需要填写名称。',
      ),
      v.check(value => {
        const titles = rows(value)
          .map(row => (typeof row.title === 'string' ? row.title.trim() : ''))
          .filter(Boolean)
        return !editions || new Set(titles).size === titles.length
      }, '版本名称不能重复。'),
      v.check(
        value => rows(value).every(row => typeof row[priceKey] !== 'number' || row[priceKey] >= 0),
        '价格不能为负数。',
      ),
      v.check(
        value =>
          rows(value).every(
            row =>
              row[priceKey] == null ||
              (typeof row[currencyKey] === 'string' && row[currencyKey].trim() !== ''),
          ),
        '请为每个价格选择币种。',
      ),
      v.check(
        value =>
          rows(value).every(row =>
            editions
              ? row.jan == null || /^(\d{8}|\d{13})$/.test(String(row.jan))
              : row.isbn == null || /^(\d{9}[\dX]|\d{13})$/.test(String(row.isbn)),
          ),
        editions ? 'JAN 码为 8 位或 13 位数字。' : 'ISBN 为 10 位或 13 位数字。',
      ),
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
