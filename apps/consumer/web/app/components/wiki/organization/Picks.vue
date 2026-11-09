<script setup lang="ts">
  import { useEntryLinks } from '~/features/wiki/composables/useEntryLinks'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import type { RelationRow } from '~/features/wiki/editor/relations'
  import type { EditorPanel } from '~/features/wiki/editor/route'
  import type { WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiOrganizationPicks' })

  const props = defineProps<{ entry: EditableEntry; panel: EditorPanel | null }>()
  const nav = usePageNav()
  const active = usePageActive()
  const EMPTY: RelationRow['period'] = {
    period_from: null,
    period_from_precision: null,
    period_to: null,
    period_to_precision: null,
  }
  const period = ref({ ...EMPTY })
  const parents = useEntryLinks(() => props.entry, 'PARENT', 'held')
  const children = useEntryLinks(() => props.entry, 'PARENT', 'given')
  const members = useEntryLinks(() => props.entry, 'MEMBER', 'held')
  const opened = (panel: EditorPanel) =>
    computed(() => active.value && props.entry.type === 'ORGANIZATION' && props.panel === panel)
  const taken = (links: ReturnType<typeof useEntryLinks>) =>
    computed(() => links.rows.value.filter(row => row.state !== 'removed').map(row => row.other.id))
  const dialogs = [
    {
      panel: 'parent',
      title: '添加从属',
      types: ['ORGANIZATION'],
      placeholder: '组织名',
      links: parents,
    },
    {
      panel: 'child',
      title: '添加下属组织',
      types: ['ORGANIZATION'],
      placeholder: '组织名',
      links: children,
    },
    {
      panel: 'member',
      title: '添加成员',
      types: ['PERSON'],
      placeholder: '人物名',
      links: members,
    },
  ].map(item => ({
    ...item,
    types: item.types as WikiSearchItem['type'][],
    open: opened(item.panel as EditorPanel),
    taken: taken(item.links),
  }))
  watch(
    () => props.panel,
    () => (period.value = { ...EMPTY }),
  )

  function close() {
    void nav.close(['panel'])
  }

  async function add(links: ReturnType<typeof useEntryLinks>, item: WikiSearchItem) {
    await links.add({ id: item.id, type: item.type, label: item.label }, period.value)
    close()
  }
</script>

<template>
  <WikiEditorPick
    v-for="dialog in dialogs"
    :key="dialog.panel"
    :open="dialog.open.value"
    :title="dialog.title"
    :types="dialog.types"
    :exclude="[entry.id]"
    :taken="dialog.taken.value"
    :placeholder="dialog.placeholder"
    confirm="添加"
    @close="close"
    @pick="item => add(dialog.links, item)"
  >
    <template #default="{ picked }">
      <WikiOrganizationPeriodFields v-if="picked" v-model="period" />
    </template>
  </WikiEditorPick>
</template>
