import { TimeFormatEnum, timeFormat } from '~/utils/time-format'
import { enumLabel } from '~/features/creator/editor/presentation/enum-labels'

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

export function fmt(value: unknown): string {
  if (value == null || value === '') return '（空）'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (value instanceof Date) return timeFormat(value, TimeFormatEnum.YYYY_MM_DD)
  if (typeof value === 'string' && ISO_DATETIME.test(value)) {
    return timeFormat(value, TimeFormatEnum.YYYY_MM_DD)
  }
  return String(value)
}

export function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0)
}

export function isMedia(value: unknown): value is { id: number; src: string } {
  return !!value && typeof value === 'object' && !Array.isArray(value) && 'src' in value
}

export function mediaSrc(value: unknown): string {
  return isMedia(value) ? value.src : ''
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export interface RefDisplayValue {
  id: number
  name: string
  cover: string | null
}

export function asRefValues(value: unknown): RefDisplayValue[] {
  if (!Array.isArray(value)) return []
  const out: RefDisplayValue[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || typeof (entry as { id?: unknown }).id !== 'number') {
      continue
    }
    const record = entry as { id: number; name?: unknown; cover?: unknown }
    out.push({
      id: record.id,
      name: typeof record.name === 'string' ? record.name : '',
      cover: typeof record.cover === 'string' ? record.cover : null,
    })
  }
  return out
}

export const REF_ATTR_LABEL: Record<string, string> = { actors: '声优' }

const ATTR_KEY_LABEL: Record<string, string> = { note: '备注', role: '角色', relation: '关系类型' }
const RELATION_ROLE_ENUM: Record<string, string> = {
  staffs: 'GalgameStaffRole',
  characters: 'CharacterRole',
  producers: 'ProducerRole',
}

export function attrKeyLabel(key: string): string {
  return ATTR_KEY_LABEL[key] ?? key
}

export function attrValueLabel(op: Record<string, unknown>, key: string, value: unknown): string {
  const relationField = (op.field ?? op.relation) as string | undefined
  if (key === 'role' && relationField && RELATION_ROLE_ENUM[relationField]) {
    return enumLabel(RELATION_ROLE_ENUM[relationField], String(value))
  }
  return fmt(value)
}
