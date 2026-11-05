<script setup lang="ts">
  import { Button, Empty, Inline, Panel, SearchInput, Stack } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiWorkCast' })

  const props = defineProps<{ work: EditableEntry }>()
  const editor = inject(ENTRY_EDITOR)!
  const parts = useEditorParts(editor, () => ({
    id: props.work.id,
    type: props.work.type,
    label: props.work.label,
  }))
  const filter = ref('')

  const names = (id: number) =>
    editor
      .property(id, 'LABEL')
      .values.map(item => item.value.text ?? '')
      .filter(Boolean)
  const voices = (id: number) =>
    editor
      .property(id, 'CREDIT')
      .values.map(item => item.value.text ?? item.value.target?.label ?? '')
      .filter(Boolean)
  const rows = computed(() =>
    parts.entriesOf('APPEARANCE').map(item => ({ id: item.id, names: names(item.id) })),
  )
  const shown = computed(() => {
    const keyword = filter.value.trim()
    return keyword
      ? rows.value.filter(row =>
          [...row.names, ...voices(row.id)].some(text => text.includes(keyword)),
        )
      : rows.value
  })
  const twinOf = (row: (typeof rows.value)[number]) =>
    rows.value.find(
      other => other.id !== row.id && other.names.some(name => row.names.includes(name)),
    )?.id ?? null
</script>

<template>
  <Stack gap="md">
    <Inline gap="sm" align="center" :wrap="false" class="sticky top-0 z-10 bg-canvas py-1">
      <SearchInput v-model="filter" placeholder="按名字或配音筛选" class="min-w-0 flex-1" />
      <Button size="sm" class="shrink-0" @click="parts.cast()">
        <template #icon><Plus /></template>
        添加出场角色
      </Button>
    </Inline>
    <Panel title="出场角色" :count="rows.length" :padded="false">
      <Empty v-if="!shown.length" :title="rows.length ? '没有符合的出场角色' : '还没有出场角色'" />
      <Stack v-else gap="none" align="stretch" class="divide-y divide-line">
        <WikiWorkCastRow
          v-for="row in shown"
          :key="row.id"
          :appearance="row.id"
          :twin="twinOf(row)"
        />
      </Stack>
    </Panel>
  </Stack>
</template>
