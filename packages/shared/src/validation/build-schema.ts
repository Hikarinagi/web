import * as v from 'valibot'
import { VALIDATION_MESSAGES } from './messages.js'

export type ValidationValueType =
  | 'string'
  | 'string[]'
  | 'int'
  | 'float'
  | 'boolean'
  | 'date'
  | 'media'
  | 'enum'
  | 'enum[]'
  | 'object'
  | 'object[]'

const VALIDATION_VALUE_TYPE_REGISTRY: Record<ValidationValueType, true> = {
  string: true,
  'string[]': true,
  int: true,
  float: true,
  boolean: true,
  date: true,
  media: true,
  enum: true,
  'enum[]': true,
  object: true,
  'object[]': true,
}

export function isValidationValueType(value: unknown): value is ValidationValueType {
  return typeof value === 'string' && value in VALIDATION_VALUE_TYPE_REGISTRY
}

export interface ValidationRules {
  required?: boolean
  min_length?: number
  max_length?: number
  min?: number
  max?: number
  pattern?: string
  pattern_message?: string
}

export function hasFieldRules(rules: ValidationRules): boolean {
  return (
    rules.required === true ||
    rules.min_length != null ||
    rules.max_length != null ||
    rules.min != null ||
    rules.max != null ||
    rules.pattern != null
  )
}

export interface BuildOptions {
  value_type: ValidationValueType
  nullable?: boolean
  enum_values?: readonly string[]
}

export function buildFieldValidator(
  rules: ValidationRules,
  options: BuildOptions,
): v.GenericSchema {
  const base = buildBaseSchema(rules, options)
  if (rules.required) {
    return v.nonNullable(base, VALIDATION_MESSAGES.required) as unknown as v.GenericSchema
  }
  if (options.nullable) return v.nullable(base)
  return base
}

function buildBaseSchema(rules: ValidationRules, options: BuildOptions): v.GenericSchema {
  switch (options.value_type) {
    case 'string':
      return buildStringSchema(rules)
    case 'string[]':
      return buildArraySchema(v.string(VALIDATION_MESSAGES.invalidString), rules)
    case 'int':
      return buildNumberSchema(rules, true)
    case 'float':
      return buildNumberSchema(rules, false)
    case 'boolean':
      return v.boolean(VALIDATION_MESSAGES.invalidBoolean)
    case 'date':
      return v.pipe(
        v.date(VALIDATION_MESSAGES.invalidDate),
        v.check(date => !Number.isNaN(date.getTime()), VALIDATION_MESSAGES.invalidDate),
      )
    case 'media':
      return v.object(
        {
          id: v.number(VALIDATION_MESSAGES.invalidMedia),
          src: v.pipe(
            v.string(VALIDATION_MESSAGES.invalidMedia),
            v.nonEmpty(VALIDATION_MESSAGES.invalidMedia),
          ),
        },
        VALIDATION_MESSAGES.invalidMedia,
      )
    case 'enum':
      return options.enum_values && options.enum_values.length
        ? v.picklist(
            [...options.enum_values] as [string, ...string[]],
            VALIDATION_MESSAGES.invalidEnum,
          )
        : buildStringSchema(rules)
    case 'enum[]':
      return buildArraySchema(
        options.enum_values && options.enum_values.length
          ? v.picklist(
              [...options.enum_values] as [string, ...string[]],
              VALIDATION_MESSAGES.invalidEnum,
            )
          : v.string(VALIDATION_MESSAGES.invalidString),
        rules,
      )
    case 'object':
      return v.record(v.string(), v.unknown(), VALIDATION_MESSAGES.invalidString)
    case 'object[]':
      return buildArraySchema(v.record(v.string(), v.unknown()), rules)
  }
}

function buildStringSchema(rules: ValidationRules): v.GenericSchema {
  const pipes: v.GenericPipeItem<string, string, v.BaseIssue<unknown>>[] = []
  if (rules.required) pipes.push(v.nonEmpty(VALIDATION_MESSAGES.required))
  if (rules.min_length != null) {
    pipes.push(v.minLength(rules.min_length, VALIDATION_MESSAGES.minLength(rules.min_length)))
  }
  if (rules.max_length != null) {
    pipes.push(v.maxLength(rules.max_length, VALIDATION_MESSAGES.maxLength(rules.max_length)))
  }
  if (rules.pattern) {
    pipes.push(
      v.regex(new RegExp(rules.pattern), rules.pattern_message ?? VALIDATION_MESSAGES.pattern),
    )
  }
  const base = v.string(VALIDATION_MESSAGES.invalidString)
  return pipes.length ? v.pipe(base, ...pipes) : base
}

function buildNumberSchema(rules: ValidationRules, integer: boolean): v.GenericSchema {
  const pipes: v.GenericPipeItem<number, number, v.BaseIssue<unknown>>[] = []
  if (integer) pipes.push(v.integer(VALIDATION_MESSAGES.invalidInt))
  if (rules.min != null) pipes.push(v.minValue(rules.min, VALIDATION_MESSAGES.minValue(rules.min)))
  if (rules.max != null) pipes.push(v.maxValue(rules.max, VALIDATION_MESSAGES.maxValue(rules.max)))
  const base = v.number(VALIDATION_MESSAGES.invalidNumber)
  return pipes.length ? v.pipe(base, ...pipes) : base
}

function buildArraySchema(itemSchema: v.GenericSchema, rules: ValidationRules): v.GenericSchema {
  const pipes: v.GenericPipeItem<unknown[], unknown[], v.BaseIssue<unknown>>[] = []
  if (rules.required) pipes.push(v.minLength(1, VALIDATION_MESSAGES.required))
  if (rules.min_length != null && !rules.required) {
    pipes.push(v.minLength(rules.min_length, VALIDATION_MESSAGES.minItems(rules.min_length)))
  }
  if (rules.max_length != null) {
    pipes.push(v.maxLength(rules.max_length, VALIDATION_MESSAGES.maxItems(rules.max_length)))
  }
  const base = v.array(itemSchema, VALIDATION_MESSAGES.invalidArray)
  return pipes.length ? v.pipe(base, ...pipes) : base
}
