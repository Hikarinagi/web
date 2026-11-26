import type { MaybeRefOrGetter } from 'vue'
import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
import { emptyValue, isBlank, type ValueDraft } from '~/features/wiki/editor/draft'

type Field = 'LABEL' | 'CREDIT'
type Fact = 'CAST_ROLE' | 'PROTAGONIST' | 'CAPTURABLE'
type Tracked = Field | Fact

export function useCastEntry(appearance: MaybeRefOrGetter<number>) {
  const editor = inject(ENTRY_EDITOR)!
  const id = computed(() => toValue(appearance))
  const definition = computed(() => editor.definitions.value.get('APPEARANCE'))
  const field = (property: Tracked) =>
    definition.value?.properties.find(item => item.property === property)
  const view = (property: Tracked | 'IMAGE') => editor.property(id.value, property)
  const live = (property: Tracked | 'IMAGE') =>
    view(property).values.filter(item => item.state !== 'removed' && item.state !== 'moved_out')
  const general = (property: Fact) =>
    live(property).find(item => !item.value.versions.length) ?? null
  const voices = computed(() => live('CREDIT').filter(item => item.value.code === 'VOICE'))
  type Voice = (typeof voices.value)[number]
  const label = computed(() => live('LABEL')[0] ?? null)
  const image = computed(() => live('IMAGE')[0]?.value.media ?? null)
  const created = computed(() => id.value < 0)
  const touched = (property: Tracked) =>
    !created.value && view(property).values.some(item => item.state !== 'same')
  const dirty = computed(
    () =>
      created.value ||
      (['LABEL', 'CREDIT', 'CAST_ROLE', 'PROTAGONIST', 'CAPTURABLE'] as const).some(touched),
  )
  const deleted = computed(() => id.value in editor.draft.value.deleted)

  function write(property: Tracked, current: { id: number } | null, next: ValueDraft) {
    if (current) {
      if (isBlank(next)) editor.remove(current.id)
      else editor.set(current.id, next)
    } else if (!isBlank(next)) editor.add(id.value, property, next)
  }

  function mark(property: 'PROTAGONIST' | 'CAPTURABLE') {
    return computed({
      get: () => general(property)?.value.code === 'YES',
      set: on => {
        const current = general(property)
        if (on) write(property, current, { ...(current?.value ?? emptyValue()), code: 'YES' })
        else if (current?.value.code === 'YES') editor.remove(current.id)
      },
    })
  }

  const partial = (property: 'PROTAGONIST' | 'CAPTURABLE') =>
    computed(() => {
      const items = live(property).filter(
        item => item.value.versions.length && item.value.code === 'YES',
      )
      return items.length
        ? {
            focus: items[0]!.id,
            versions: items.flatMap(item => item.value.versions.map(version => version.label)),
          }
        : null
    })

  const name = computed({
    get: () => label.value?.value.text ?? '',
    set: text =>
      write('LABEL', label.value, { ...(label.value?.value ?? emptyValue()), text: text || null }),
  })
  function setVoice(
    voice: Voice | null,
    next: Pick<ValueDraft, 'text' | 'target'>,
    versions: ValueDraft['versions'] = [],
  ) {
    write('CREDIT', voice, {
      ...(voice?.value ?? { ...emptyValue(), versions }),
      ...next,
      code: 'VOICE',
    })
  }

  function setVersions(voice: Voice, versions: ValueDraft['versions']) {
    editor.set(voice.id, { ...voice.value, versions })
  }
  const role = computed({
    get: () => general('CAST_ROLE')?.value.code ?? null,
    set: code => {
      const current = general('CAST_ROLE')
      write('CAST_ROLE', current, { ...(current?.value ?? emptyValue()), code })
    },
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
    deleted,
    erase: (on: boolean) => editor.erase(id.value, on),
    name,
    setVoice,
    setVersions,
    removeVoice: (voice: Voice) => editor.remove(voice.id),
    role,
    protagonist: mark('PROTAGONIST'),
    capturable: mark('CAPTURABLE'),
    partialProtagonist: partial('PROTAGONIST'),
    partialCapturable: partial('CAPTURABLE'),
    others: computed(() => Math.max(live('LABEL').length - 1, 0)),
  }
}
