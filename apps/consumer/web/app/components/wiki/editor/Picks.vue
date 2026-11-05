<script setup lang="ts">
  import { FormField, Select } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { emptyValue, type EditableEntry } from '~/features/wiki/editor/draft'
  import type { EditorPanel } from '~/features/wiki/editor/route'
  import type { WikiSearchItem } from '~/features/wiki/entries'
  import { codeLabel } from '~/features/wiki/values'

  defineOptions({ name: 'WikiEditorPicks' })

  const props = defineProps<{ entry: EditableEntry; panel: EditorPanel | null; base: string }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const nav = useTabNav()
  const active = usePageActive()
  const kind = ref<string | null>(null)
  const relating = computed(
    () => active.value && props.panel === 'relation' && props.entry.type === 'GAME',
  )
  const joining = computed(
    () => active.value && props.panel === 'same' && props.entry.type === 'APPEARANCE',
  )
  watch(relating, next => {
    if (next) kind.value = null
  })
  const targets = (property: 'GAME_RELATION' | 'APPEARANCE_RELATION') => [
    props.entry.id,
    ...editor
      .property(props.entry.id, property)
      .values.flatMap(item => (item.value.target ? [item.value.target.id] : [])),
  ]
  const kinds = computed(() =>
    (
      editor.definitions.value
        .get('GAME')
        ?.properties.find(item => item.property === 'GAME_RELATION')?.codes ?? []
    ).map(value => ({ value, label: codeLabel('GAME_RELATION', value) })),
  )

  function close() {
    void nav.dismiss({ path: props.base, query: route.query })
  }

  function add(property: 'GAME_RELATION' | 'APPEARANCE_RELATION', item: WikiSearchItem) {
    editor.add(props.entry.id, property, {
      ...emptyValue(),
      target: { id: item.id, type: item.type, label: item.label },
      code: property === 'GAME_RELATION' ? kind.value : 'SAME_PERSON',
    })
    close()
  }
</script>

<template>
  <WikiEditorPick
    :open="relating"
    title="添加相关作品"
    :types="['GAME']"
    :exclude="targets('GAME_RELATION')"
    confirm="添加"
    :ready="Boolean(kind)"
    create="GAME"
    @close="close"
    @pick="item => add('GAME_RELATION', item)"
  >
    <FormField name="kind" label="它是本作的">
      <Select v-model="kind" :options="kinds" placeholder="请选择" />
    </FormField>
  </WikiEditorPick>
  <WikiEditorPick
    :open="joining"
    title="添加其他作品中的出场"
    :types="['APPEARANCE']"
    :exclude="targets('APPEARANCE_RELATION')"
    confirm="添加"
    @close="close"
    @pick="item => add('APPEARANCE_RELATION', item)"
  />
</template>
