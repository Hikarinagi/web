import type { MaybeRefOrGetter } from 'vue'
import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
import { emptyValue, isBlank, type ValueDraft } from '~/features/wiki/editor/draft'
import { ENTRY_PAGE } from '~/features/wiki/editor/page'

type Field = 'LABEL' | 'CREDIT'

export function useCastEntry(appearance: MaybeRefOrGetter<number>) {
  const editor = inject(ENTRY_EDITOR)!
  const id = computed(() => toValue(appearance))
  const definition = computed(() => editor.definitions.value.get('APPEARANCE'))
  const field = (property: Field) =>
    definition.value?.properties.find(item => item.property === property)
  const view = (property: Field | 'IMAGE') => editor.property(id.value, property)
  const live = (property: Field | 'IMAGE') =>
    view(property).values.filter(item => item.state !== 'removed' && item.state !== 'moved_out')
  const voices = computed(() => live('CREDIT').filter(item => item.value.code === 'VOICE'))
  const label = computed(() => live('LABEL')[0] ?? null)
  const voice = computed(() => voices.value[0] ?? null)
  const image = computed(() => live('IMAGE')[0]?.value.media ?? null)
  const created = computed(() => id.value < 0)
  const touched = (property: Field) =>
    !created.value && view(property).values.some(item => item.state !== 'same')
  const dirty = computed(() => created.value || touched('LABEL') || touched('CREDIT'))
  const page = inject(ENTRY_PAGE, null)
  const hinted = computed(
    () =>
      (page?.hints.value ?? []).filter(
        hint => (hint.proposal ?? hint.statement)?.entry_id === id.value,
      ).length,
  )

  function write(property: Field, current: { id: number } | null, next: ValueDraft) {
    if (current) {
      if (isBlank(next)) editor.remove(current.id)
      else editor.set(current.id, next)
    } else if (!isBlank(next)) editor.add(id.value, property, next)
  }

  const name = computed({
    get: () => label.value?.value.text ?? '',
    set: text =>
      write('LABEL', label.value, { ...(label.value?.value ?? emptyValue()), text: text || null }),
  })
  const actor = computed({
    get: () => ({
      text: voice.value?.value.text ?? null,
      target: voice.value?.value.target ?? null,
    }),
    set: next =>
      write('CREDIT', voice.value, {
        ...(voice.value?.value ?? emptyValue()),
        ...next,
        code: 'VOICE',
      }),
  })

  return {
    editor,
    field,
    view,
    label,
    voices,
    image,
    created,
    touched,
    dirty,
    hinted,
    name,
    actor,
    others: computed(() => Math.max(live('LABEL').length - 1, 0)),
    more: computed(() => Math.max(voices.value.length - 1, 0)),
  }
}
