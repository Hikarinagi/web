import type { EditableEntry, EditorDraft, EntryDefinition, EntryStatement } from './draft'
import { propertyOf, type WorkingValue } from './working'

type EntryType = EditableEntry['type']

export interface ReviewRow extends WorkingValue {
  label: string
  shape: string
}

export interface ReviewGroup {
  id: number
  type: EntryType
  created: boolean
  rows: ReviewRow[]
}

export function reviewOf(
  draft: EditorDraft,
  entries: {
    id: number
    type: EntryType
    entry: Pick<EditableEntry, 'id' | 'statements'> | null
  }[],
  definitions: Map<EntryType, EntryDefinition>,
  statements: Map<number, { entry: number; statement: EntryStatement }>,
): ReviewGroup[] {
  return entries
    .filter(item => item.type !== 'CHARACTER')
    .map(({ id, type, entry }) => ({
      id,
      type,
      created: id < 0,
      rows: (definitions.get(type)?.properties ?? []).flatMap(definition =>
        propertyOf(entry, id, definition.property, draft, statements)
          .values.filter(item => item.state !== 'same' || draft.positions[item.id] !== undefined)
          .map(item => ({ ...item, label: definition.label, shape: definition.shape })),
      ),
    }))
    .filter(group => group.created || group.rows.length || draft.detached.includes(group.id))
}
