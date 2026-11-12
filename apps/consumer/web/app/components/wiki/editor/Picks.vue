<script setup lang="ts">
  import { Checkbox, IconButton, Inline, Select, Text } from '@hina-ui/vue'
  import { ArrowLeftRight } from '@lucide/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { useWorkRelations } from '~/features/wiki/composables/useWorkRelations'
  import { emptyValue, type EditableEntry } from '~/features/wiki/editor/draft'
  import type { RelationSide } from '~/features/wiki/editor/relations'
  import type { EditorPanel } from '~/features/wiki/editor/route'
  import type { WikiSearchItem } from '~/features/wiki/entries'
  import { codeLabel, relationLead } from '~/features/wiki/values'

  defineOptions({ name: 'WikiEditorPicks' })

  const props = defineProps<{ entry: EditableEntry; panel: EditorPanel | null }>()
  const editor = inject(ENTRY_EDITOR)!
  const nav = usePageNav()
  const active = usePageActive()
  const kind = ref<string | null>(null)
  const side = ref<RelationSide>('given')
  const relations = useWorkRelations(() => props.entry)
  const relating = computed(
    () => active.value && props.panel === 'relation' && props.entry.type === 'GAME',
  )
  const joining = computed(
    () => active.value && props.panel === 'same' && props.entry.type === 'APPEARANCE',
  )
  watch(relating, next => {
    if (!next) return
    kind.value = null
    side.value = 'given'
  })
  const concealed = ref(false)
  watch(joining, next => {
    if (next) concealed.value = false
  })
  const related = computed(() =>
    relations.rows.value.filter(row => row.state !== 'removed').map(row => row.other.id),
  )
  const joined = computed(() => [
    ...[...editor.entries.value.values()]
      .filter(item => item.type === 'APPEARANCE' && item.id !== props.entry.id)
      .map(item => item.id),
    ...editor
      .property(props.entry.id, 'APPEARANCE_RELATION')
      .values.flatMap(item => (item.value.target ? [item.value.target.id] : [])),
  ])
  const kinds = computed(() =>
    (
      editor.definitions.value
        .get('GAME')
        ?.properties.find(item => item.property === 'GAME_RELATION')?.codes ?? []
    ).map(value => ({ value, label: codeLabel('GAME_RELATION', value) })),
  )

  function close() {
    void nav.close(['panel'])
  }

  async function relate(item: WikiSearchItem) {
    if (!kind.value) return
    await relations.add(item, kind.value, side.value)
    close()
  }

  function join(item: WikiSearchItem) {
    editor.add(props.entry.id, 'APPEARANCE_RELATION', {
      ...emptyValue(),
      target: { id: item.id, type: item.type, label: item.label },
      code: 'SAME_PERSON',
      is_public: !concealed.value,
    })
    close()
  }
</script>

<template>
  <WikiEditorPick
    :open="relating"
    title="添加相关作品"
    :types="['GAME']"
    :exclude="[entry.id]"
    :taken="related"
    note="已有关系"
    placeholder="作品名"
    confirm="添加"
    :ready="Boolean(kind)"
    create="GAME"
    @close="close"
    @pick="relate"
  >
    <template #default="{ picked }">
      <Inline v-if="picked" gap="sm" align="center" :wrap="false">
        <Text size="sm" class="w-20 shrink-0">{{ relationLead(kind, side) }}</Text>
        <Select v-model="kind" :options="kinds" placeholder="关系" aria-label="关系" class="w-28" />
        <IconButton
          label="对调"
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="kind === 'SAME_SERIES'"
          @click="side = side === 'held' ? 'given' : 'held'"
        >
          <ArrowLeftRight />
        </IconButton>
      </Inline>
    </template>
  </WikiEditorPick>
  <WikiEditorPick
    :open="joining"
    title="添加出场"
    :types="['APPEARANCE']"
    :exclude="[entry.id]"
    :taken="joined"
    placeholder="角色名"
    confirm="添加"
    @close="close"
    @pick="join"
  >
    <template #default="{ picked }">
      <Checkbox v-if="picked" v-model="concealed">未公开</Checkbox>
    </template>
  </WikiEditorPick>
</template>
