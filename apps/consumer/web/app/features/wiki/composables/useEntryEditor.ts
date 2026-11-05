import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import {
  emptyDraft,
  operationsOf,
  sameValue,
  valueOf,
  type DeprecationReason,
  type EditableEntry,
  type EditorDraft,
  type EntryDefinition,
  type ValueDraft,
} from '~/features/wiki/editor/draft'
import { reviewCount, reviewOf } from '~/features/wiki/editor/review'
import { propertyOf } from '~/features/wiki/editor/working'

type Property = EditableEntry['statements'][number]['property']

const omit = <T>(record: Record<number, T>, id: number): Record<number, T> =>
  Object.fromEntries(Object.entries(record).filter(([key]) => Number(key) !== id))

export function useEntryEditor(page: {
  key: MaybeRefOrGetter<string>
  title: MaybeRefOrGetter<string>
  entries: MaybeRefOrGetter<EditableEntry[]>
  definitions: MaybeRefOrGetter<EntryDefinition[]>
  versions?: MaybeRefOrGetter<NonNullable<ValueDraft['target']>[]>
  root?: number
}) {
  const store = useWikiDraftsStore()
  const route = useRoute()
  const key = computed(() => toValue(page.key))
  const draft = computed<EditorDraft>(() => store.read(key.value) ?? emptyDraft())
  const entries = computed(() => new Map(toValue(page.entries).map(entry => [entry.id, entry])))
  const statements = computed(
    () =>
      new Map(
        toValue(page.entries).flatMap(entry =>
          entry.statements.map(
            statement => [statement.id, { entry: entry.id, statement }] as const,
          ),
        ),
      ),
  )
  const definitions = computed(
    () => new Map(toValue(page.definitions).map(definition => [definition.type, definition])),
  )
  const members = computed(() => [
    ...[...entries.value.values()].map(entry => ({ id: entry.id, type: entry.type, entry })),
    ...draft.value.created.map(item => ({ id: item.id, type: item.type, entry: null })),
  ])
  const count = computed(() =>
    reviewCount(
      reviewOf(draft.value, members.value, definitions.value, statements.value),
      draft.value,
    ),
  )
  let next = -1
  watch(count, shown => store.show(key.value, shown), { immediate: true })

  watch(
    [statements, () => store.read(key.value)],
    ([known, stored]) => {
      if (!stored || !known.size) return
      const kept = new Set([...known.keys(), ...stored.added.map(item => item.id)])
      const owners = new Set([...entries.value.keys(), ...stored.created.map(item => item.id)])
      const media = new Set(
        [
          ...[...known.values()].map(item => item.statement.media?.id),
          ...stored.added.map(item => item.value.media?.id),
          ...Object.values(stored.changed).map(value => value.media?.id),
        ].filter((id): id is number => id !== undefined),
      )
      const stale =
        stored.added.some(item => !owners.has(item.entry)) ||
        [stored.changed, stored.removed, stored.moved, stored.positions].some(map =>
          Object.keys(map).some(id => !kept.has(Number(id))),
        ) ||
        stored.restored.some(id => !kept.has(id)) ||
        Object.keys(stored.rated).some(id => !media.has(Number(id))) ||
        stored.detached.some(id => !owners.has(id))
      if (!stale) return
      store.update(key.value, { title: toValue(page.title), path: route.fullPath }, current => {
        const known = (map: Record<number, unknown>) =>
          Object.fromEntries(Object.entries(map).filter(([id]) => kept.has(Number(id))))
        current.added = current.added.filter(item => owners.has(item.entry))
        current.changed = known(current.changed) as EditorDraft['changed']
        current.removed = known(current.removed) as EditorDraft['removed']
        current.moved = known(current.moved) as EditorDraft['moved']
        current.positions = known(current.positions) as EditorDraft['positions']
        current.restored = current.restored.filter(id => kept.has(id))
        current.rated = Object.fromEntries(
          Object.entries(current.rated).filter(([id]) => media.has(Number(id))),
        )
        current.detached = current.detached.filter(id => owners.has(id))
      })
    },
    { immediate: true },
  )

  function edit(entry: number, change: (draft: EditorDraft) => void) {
    store.update(key.value, { title: toValue(page.title), path: route.fullPath }, current => {
      const revision = entries.value.get(entry)?.revision
      if (revision !== undefined && current.base[entry] === undefined)
        current.base[entry] = revision
      change(current)
    })
  }

  function ownerOf(id: number) {
    return statements.value.get(id)?.entry ?? draft.value.added.find(item => item.id === id)?.entry
  }

  function freshId() {
    const used = [
      ...draft.value.created.map(item => item.id),
      ...draft.value.added.map(item => item.id),
    ]
    next = Math.min(next, ...used.map(id => id - 1), -1)
    return next--
  }

  return {
    key,
    root: page.root ?? null,
    draft,
    count,
    entries,
    statements,
    definitions,
    versions: computed(() => toValue(page.versions) ?? []),
    members,
    property(entry: number, property: Property) {
      return propertyOf(
        entries.value.get(entry) ?? null,
        entry,
        property,
        draft.value,
        statements.value,
      )
    },
    set(id: number, value: ValueDraft) {
      const entry = ownerOf(id)
      if (entry === undefined) return
      edit(entry, current => {
        const added = current.added.find(item => item.id === id)
        if (added) {
          added.value = value
          return
        }
        const statement = statements.value.get(id)?.statement
        if (statement && sameValue(valueOf(statement), value))
          current.changed = omit(current.changed, id)
        else current.changed[id] = value
      })
    },
    add(entry: number, property: Property, value: ValueDraft) {
      const id = freshId()
      edit(entry, current => current.added.push({ id, entry, property, value }))
      return id
    },
    create(type: EditableEntry['type']) {
      const id = freshId()
      edit(id, current => current.created.push({ id, type }))
      return id
    },
    remove(id: number, reason: DeprecationReason | null = null) {
      const entry = ownerOf(id)
      if (entry === undefined) return
      edit(entry, current => {
        if (id < 0) current.added = current.added.filter(item => item.id !== id)
        else if (current.restored.includes(id))
          current.restored = current.restored.filter(item => item !== id)
        else current.removed[id] = reason
      })
    },
    reason(id: number, reason: DeprecationReason) {
      const entry = ownerOf(id)
      if (entry !== undefined) edit(entry, current => (current.removed[id] = reason))
    },
    revert(id: number) {
      const entry = ownerOf(id)
      if (entry === undefined) return
      const media = [
        statements.value.get(id)?.statement.media?.id,
        draft.value.changed[id]?.media?.id,
        draft.value.added.find(item => item.id === id)?.value.media?.id,
      ]
      edit(entry, current => {
        for (const item of media) if (item !== undefined) current.rated = omit(current.rated, item)
        current.changed = omit(current.changed, id)
        current.removed = omit(current.removed, id)
        current.moved = omit(current.moved, id)
        current.positions = omit(current.positions, id)
        current.restored = current.restored.filter(item => item !== id)
        current.added = current.added.filter(item => item.id !== id)
      })
    },
    restore(id: number) {
      const entry = ownerOf(id)
      if (entry !== undefined)
        edit(entry, current => {
          if (!current.restored.includes(id)) current.restored.push(id)
        })
    },
    move(id: number, target: number) {
      const entry = ownerOf(id)
      if (entry === undefined) return
      edit(entry, current => {
        if (target === entry) current.moved = omit(current.moved, id)
        else current.moved[id] = target
      })
    },
    order(entry: number, property: Property, id: number, step: -1 | 1) {
      const list = propertyOf(
        entries.value.get(entry) ?? null,
        entry,
        property,
        draft.value,
        statements.value,
      ).values.filter(item => item.id > 0)
      const index = list.findIndex(item => item.id === id)
      const other = list[index + step]
      if (index < 0 || !other) return
      ;[list[index], list[index + step]] = [other, list[index]!]
      const original = list
        .map(item => statements.value.get(item.id)!.statement)
        .sort((a, b) => a.position - b.position || a.id - b.id)
      const unchanged = original.every((statement, position) => list[position]?.id === statement.id)
      edit(entry, current => {
        list.forEach((item, position) => {
          if (unchanged) current.positions = omit(current.positions, item.id)
          else current.positions[item.id] = position
        })
      })
    },
    unorder(ids: number[]) {
      const entry = ids[0] === undefined ? undefined : ownerOf(ids[0])
      if (entry === undefined) return
      edit(entry, current => {
        for (const id of ids) current.positions = omit(current.positions, id)
      })
    },
    uncreate(id: number) {
      edit(id, current => {
        const owned = current.added
          .filter(item => item.entry === id)
          .flatMap(item =>
            item.value.target && item.value.target.id < 0 ? [item.value.target.id] : [],
          )
          .filter(target =>
            current.created.some(entry => entry.id === target && entry.type === 'CHARACTER'),
          )
        const gone = new Set([id, ...owned])
        current.created = current.created.filter(entry => !gone.has(entry.id))
        current.added = current.added.filter(
          item => !gone.has(item.entry) && !(item.value.target && gone.has(item.value.target.id)),
        )
        current.moved = Object.fromEntries(
          Object.entries(current.moved).filter(([, target]) => !gone.has(target)),
        )
      })
    },
    rebase(entry: number, revision: number) {
      edit(entry, current => (current.base[entry] = revision))
    },
    basis(basis: EditorDraft['basis']) {
      store.update(key.value, { title: toValue(page.title), path: route.fullPath }, current => {
        current.basis = basis
      })
    },
    detach(entry: number, on: boolean) {
      edit(entry, current => {
        current.detached = on
          ? [...current.detached.filter(item => item !== entry), entry]
          : current.detached.filter(item => item !== entry)
      })
    },
    rate(
      id: number,
      media: NonNullable<ValueDraft['media']>,
      rating: { sexual: number; violence: number },
    ) {
      const entry = ownerOf(id)
      if (entry === undefined) return
      edit(entry, current => {
        if (rating.sexual === media.sexual && rating.violence === media.violence)
          current.rated = omit(current.rated, media.id)
        else current.rated[media.id] = rating
      })
    },
    note(text: string) {
      store.update(key.value, { title: toValue(page.title), path: route.fullPath }, current => {
        current.note = text
      })
    },
    discard() {
      store.discard(key.value)
    },
    operations() {
      return operationsOf(draft.value, statements.value)
    },
  }
}

export type EntryEditor = ReturnType<typeof useEntryEditor>
export const ENTRY_EDITOR: InjectionKey<EntryEditor> = Symbol('wiki-entry-editor')
