import type { EntryEditor } from '~/features/wiki/composables/useEntryEditor'
import {
  emptyValue,
  type EditableEntry,
  type EntryStatement,
  type ValueDraft,
} from '~/features/wiki/editor/draft'

type EntryType = EditableEntry['type']
type Property = EntryStatement['property']
type Ref = NonNullable<ValueDraft['target']>

export function useEditorParts(editor: EntryEditor, owner: () => Ref) {
  const values = (entry: number, property: Property) =>
    editor
      .property(entry, property)
      .values.filter(item => item.state !== 'removed' && item.state !== 'moved_out')
      .map(item => item.value)
  const first = (entry: number, property: Property) => values(entry, property)[0] ?? null

  function entriesOf(type: EntryType): Pick<EditableEntry, 'id' | 'type'>[] {
    const loaded = [...editor.entries.value.values()].filter(
      entry => entry.type === type && !editor.draft.value.detached.includes(entry.id),
    )
    const created = editor.draft.value.created.filter(entry => entry.type === type)
    return [...loaded, ...created]
  }

  function create(type: EntryType, values: [Property, Partial<ValueDraft>][]) {
    const id = editor.create(type)
    for (const [property, value] of values) editor.add(id, property, { ...emptyValue(), ...value })
    return id
  }

  function copy(source: number, type: EntryType) {
    const definition = editor.definitions.value.get(type)
    const id = editor.create(type)
    for (const property of definition?.properties ?? []) {
      if (property.unique) continue
      for (const item of editor.property(source, property.property).values)
        if (item.state !== 'removed' && item.state !== 'moved_out')
          editor.add(id, property.property, item.value)
    }
    return id
  }

  function cast() {
    const character = editor.create('CHARACTER')
    return create('APPEARANCE', [
      ['WORK', { target: owner() }],
      ['CHARACTER', { target: { id: character, type: 'CHARACTER', label: '' } }],
      ['LABEL', {}],
    ])
  }

  return { values, first, entriesOf, create, copy, cast }
}
