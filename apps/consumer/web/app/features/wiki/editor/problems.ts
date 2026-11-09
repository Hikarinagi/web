import type {
  EditableEntry,
  EditorDraft,
  EntryDefinition,
  EntryStatement,
  ValueDraft,
} from './draft'
import { propertyOf } from './working'

type EntryType = EditableEntry['type']
type Property = EntryStatement['property']

export interface Problem {
  entry: number
  property: Property | null
  id: number | null
  message: string
}

const valid = (date: string | null, precision: string | null) => !date || Boolean(precision)

function valueProblems(property: Property, shape: string, value: ValueDraft): string[] {
  const text = (value.text ?? '').trim()
  const found: string[] = []
  if (value.value_kind === 'UNKNOWN') return found
  if (shape === 'date' && !valid(value.date, value.date_precision))
    found.push('日期应写成 2026-10-04、2026-10 或 2026')
  if (
    !valid(value.period_from, value.period_from_precision) ||
    !valid(value.period_to, value.period_to_precision)
  )
    found.push('期间的日期应写成 2026-10-04、2026-10 或 2026')
  else if (value.period_from && value.period_to && value.period_from > value.period_to)
    found.push('期间的开始晚于结束')
  if (shape === 'money' && value.amount && !/^\d+(\.\d{1,2})?$/.test(value.amount.trim()))
    found.push('价格应为数字')
  if (property === 'JAN' && text && !/^\d{13}$/.test(text)) found.push('JAN 应为 13 位数字')
  if (property === 'ISBN' && text && !/^97[89]\d{10}$/.test(text))
    found.push('ISBN 应为 978 或 979 开头的 13 位数字')
  if (property === 'VOLUME_NUMBER' && /[第卷巻]/.test(text)) found.push('卷次不写「第」「卷」')
  if (shape === 'credit' && !value.code) found.push('制作信息缺职责')
  return found
}

function filled(shape: string, value: ValueDraft): boolean {
  if (value.value_kind === 'UNKNOWN') return true
  if (shape === 'entry') return Boolean(value.target)
  if (shape === 'image') return Boolean(value.media)
  if (shape === 'date') return Boolean(value.date)
  if (shape === 'money') return Boolean(value.amount)
  if (shape === 'integer') return value.number !== null
  if (shape === 'code' || shape === 'language') return Boolean(value.code)
  if (shape === 'credit') return Boolean(value.text?.trim() || value.target)
  return Boolean(value.text?.trim())
}

export function problemsOf(
  draft: EditorDraft,
  entries: {
    id: number
    type: EntryType
    entry: Pick<EditableEntry, 'id' | 'statements'> | null
  }[],
  definitions: Map<EntryType, EntryDefinition>,
  statements: Map<number, { entry: number; statement: EntryStatement }>,
): Problem[] {
  const problems: Problem[] = []
  for (const { id, type, entry } of entries) {
    const created = id < 0
    for (const definition of definitions.get(type)?.properties ?? []) {
      const view = propertyOf(entry, id, definition.property, draft, statements)
      const live = view.values.filter(
        item => item.state !== 'removed' && item.state !== 'moved_out',
      )
      const touched = view.values.some(item => item.state !== 'same')
      const add = (message: string, item: number | null = null) =>
        problems.push({ entry: id, property: definition.property, id: item, message })
      if (definition.required && !live.length && (created || touched)) add('必填项为空')
      for (const item of live) {
        if (item.state === 'same') continue
        if (item.state === 'added' && !filled(definition.shape, item.value))
          add('还没有填写', item.id)
        for (const message of valueProblems(definition.property, definition.shape, item.value))
          add(message, item.id)
      }
      for (const item of view.values)
        if (item.state === 'removed' && !item.reason) add('请选择删除原因', item.id)
      if (definition.property === 'COVER' && touched) {
        const languages = live.map(item => item.value.language ?? '')
        if (new Set(languages).size < languages.length) add('同一语言有两张封面')
      }
    }
  }
  return problems
}
