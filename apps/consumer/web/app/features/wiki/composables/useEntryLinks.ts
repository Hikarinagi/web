import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
import { emptyValue, type EditableEntry, type ValueDraft } from '~/features/wiki/editor/draft'
import { ENTRY_PAGE } from '~/features/wiki/editor/page'
import { relationRows, type RelationRow, type RelationSide } from '~/features/wiki/editor/relations'

type Target = NonNullable<ValueDraft['target']>
type Period = RelationRow['period']

export function useEntryLinks(
  entry: () => Pick<EditableEntry, 'id' | 'type' | 'label'>,
  property: 'PARENT' | 'MEMBER',
  side: RelationSide,
) {
  const editor = inject(ENTRY_EDITOR)!
  const page = inject(ENTRY_PAGE)!
  const root = computed<Target>(() => ({
    id: entry().id,
    type: entry().type,
    label: entry().label,
  }))
  const rows = computed(() => {
    if (side === 'held')
      return relationRows(
        root.value,
        editor.property(root.value.id, property).values,
        [],
        new Map(),
      )
    const incoming = page.references.value
      .filter(group => group.property === property && group.type === root.value.type)
      .flatMap(group => group.items)
    const borrowed = new Map(
      [...editor.entries.value.values()]
        .filter(item => item.type === root.value.type && item.id !== root.value.id)
        .map(item => [
          item.id,
          {
            entry: { id: item.id, type: item.type, label: item.label },
            values: editor.property(item.id, property).values,
          },
        ]),
    )
    return relationRows(root.value, [], incoming, borrowed)
  })

  async function ready(holder: number) {
    return holder === root.value.id || Boolean(await editor.borrow(holder))
  }

  async function period(row: RelationRow, next: Period) {
    if (!(await ready(row.holder))) return
    const value = editor.property(row.holder, property).values.find(item => item.id === row.id)
    if (value) editor.set(row.id, { ...value.value, ...next })
  }

  async function remove(row: RelationRow) {
    if (await ready(row.holder)) editor.remove(row.id)
  }

  function undo(row: RelationRow) {
    for (const id of row.undo) editor.revert(id)
  }

  async function add(other: Target, next: Period) {
    const [holder, target] = side === 'held' ? [root.value.id, other] : [other.id, root.value]
    if (await ready(holder)) editor.add(holder, property, { ...emptyValue(), target, ...next })
  }

  return { rows, period, remove, undo, add }
}
