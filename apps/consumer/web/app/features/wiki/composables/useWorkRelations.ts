import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
import { emptyValue, type EditableEntry, type ValueDraft } from '~/features/wiki/editor/draft'
import { ENTRY_PAGE } from '~/features/wiki/editor/page'
import { relationRows, type RelationRow, type RelationSide } from '~/features/wiki/editor/relations'
import type { WikiSearchItem } from '~/features/wiki/entries'

type Target = NonNullable<ValueDraft['target']>

export function useWorkRelations(work: () => Pick<EditableEntry, 'id' | 'type' | 'label'>) {
  const editor = inject(ENTRY_EDITOR)!
  const page = inject(ENTRY_PAGE)!
  const root = computed<Target>(() => ({ id: work().id, type: work().type, label: work().label }))
  const incoming = computed(() =>
    page.references.value
      .filter(group => group.property === 'GAME_RELATION')
      .flatMap(group => group.items),
  )
  const borrowed = computed(
    () =>
      new Map(
        [...editor.entries.value.values()]
          .filter(entry => entry.type === 'GAME' && entry.id !== root.value.id)
          .map(entry => [
            entry.id,
            {
              entry: { id: entry.id, type: entry.type, label: entry.label },
              values: editor.property(entry.id, 'GAME_RELATION').values,
            },
          ]),
      ),
  )
  const rows = computed(() =>
    relationRows(
      root.value,
      editor.property(root.value.id, 'GAME_RELATION').values,
      incoming.value,
      borrowed.value,
    ),
  )

  async function ready(holder: number) {
    return holder === root.value.id || Boolean(await editor.borrow(holder))
  }

  const valueOf = (row: RelationRow) =>
    editor.property(row.holder, 'GAME_RELATION').values.find(item => item.id === row.id)?.value

  async function kind(row: RelationRow, code: string) {
    if (!(await ready(row.holder))) return
    const value = valueOf(row)
    if (value) editor.set(row.id, { ...value, code })
  }

  async function flip(row: RelationRow) {
    if (row.state === 'flipped') {
      for (const id of row.undo) editor.revert(id)
      return
    }
    const [holder, target] =
      row.side === 'held' ? [row.other.id, root.value] : [root.value.id, row.other]
    if (!(await ready(row.holder)) || !(await ready(holder))) return
    const value = valueOf(row)
    if (!value) return
    if (row.id > 0) editor.revert(row.id)
    editor.remove(row.id, row.id > 0 ? 'WRONG_ENTRY' : null)
    editor.add(holder, 'GAME_RELATION', { ...emptyValue(), target, code: value.code })
  }

  async function remove(row: RelationRow) {
    if (row.state === 'flipped') {
      const [added, was] = row.undo
      if (added !== undefined) editor.revert(added)
      if (was !== undefined) editor.remove(was)
      return
    }
    if (await ready(row.holder)) editor.remove(row.id)
  }

  function undo(row: RelationRow) {
    for (const id of row.undo) editor.revert(id)
  }

  async function add(
    item: Pick<WikiSearchItem, 'id' | 'type' | 'label'>,
    code: string,
    side: RelationSide,
  ) {
    const other = { id: item.id, type: item.type, label: item.label }
    const [holder, target] = side === 'held' ? [root.value.id, other] : [item.id, root.value]
    if (await ready(holder)) editor.add(holder, 'GAME_RELATION', { ...emptyValue(), target, code })
  }

  return { rows, kind, flip, remove, undo, add }
}
