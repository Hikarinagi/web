import type { EditableEntry, EditorDraft, EntryDefinition, EntryStatement } from './draft'
import { propertyOf, type WorkingValue } from './working'

type EntryType = EditableEntry['type']
type Rating = { sexual: number | null; violence: number | null }

export interface ReviewRow extends WorkingValue {
  label: string
  shape: string
  ordered: number[]
  rating: { before: Rating; after: Rating } | null
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
      rows: (definitions.get(type)?.properties ?? []).flatMap(definition => {
        const values = propertyOf(entry, id, definition.property, draft, statements).values
        const ordered = values
          .filter(item => draft.positions[item.id] !== undefined)
          .map(item => item.id)
        const rows: ReviewRow[] = values.flatMap(item => {
          const media = item.value.media
          const rated = media ? draft.rated[media.id] : undefined
          if (item.state === 'same' && !rated) return []
          return [
            {
              ...item,
              label: definition.label,
              shape: definition.shape,
              ordered: [],
              rating:
                media && rated
                  ? { before: { sexual: media.sexual, violence: media.violence }, after: rated }
                  : null,
            },
          ]
        })
        const first = values.find(item => ordered.includes(item.id))
        if (first)
          rows.push({
            ...first,
            state: 'same',
            before: null,
            label: definition.label,
            shape: definition.shape,
            ordered,
            rating: null,
          })
        return rows
      }),
    }))
    .filter(group => group.created || group.rows.length || draft.detached.includes(group.id))
}

export function reviewCount(groups: ReviewGroup[], draft: EditorDraft): number {
  return groups.reduce(
    (sum, group) =>
      sum + (group.created ? 1 : group.rows.length) + (draft.detached.includes(group.id) ? 1 : 0),
    0,
  )
}
