<script setup lang="ts">
  import { Button, Empty, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { castOrderRows, reviewOf, type ReviewGroup } from '~/features/wiki/editor/review'

  defineOptions({ name: 'WikiSaveChanges' })

  const editor = inject(ENTRY_EDITOR)!
  const all = computed(() =>
    reviewOf(
      editor.draft.value,
      editor.members.value,
      editor.definitions.value,
      editor.statements.value,
    ),
  )
  const work = computed(() =>
    editor.root === null ? undefined : editor.entries.value.get(editor.root)?.type,
  )
  const orders = computed(() => castOrderRows(all.value, work.value))
  const groups = computed(() => {
    const merged = new Set(orders.value)
    return all.value
      .map(group => ({ ...group, rows: group.rows.filter(row => !merged.has(row)) }))
      .filter(
        group =>
          group.created || group.rows.length || editor.draft.value.detached.includes(group.id),
      )
  })
  const nameOf = (group: ReviewGroup) => {
    const loaded = editor.entries.value.get(group.id)?.label
    if (loaded) return loaded
    const named = group.rows.find(
      row => ['TITLE', 'LABEL', 'NAME'].includes(row.property) && row.value.text,
    )
    return named?.value.text ?? '未命名'
  }
  const titleOf = (group: ReviewGroup) => {
    const type = editor.definitions.value.get(group.type)?.label ?? ''
    return group.created ? `新建${type}：${nameOf(group)}` : `${type}：${nameOf(group)}`
  }
</script>

<template>
  <Empty v-if="!groups.length && !orders.length" title="暂无修改" />
  <Stack v-else gap="lg">
    <WikiSaveCastOrder v-if="orders.length" :rows="orders" :game="work === 'GAME'" />
    <Stack v-for="group in groups" :key="group.id" gap="sm">
      <Inline gap="sm" align="baseline" justify="between">
        <Heading :level="3" size="xs" lang="ja">{{ titleOf(group) }}</Heading>
        <Button
          v-if="group.created"
          size="xs"
          variant="ghost"
          tone="neutral"
          @click="editor.uncreate(group.id)"
        >
          取消新建
        </Button>
      </Inline>
      <Stack gap="none" class="rounded-md border border-line">
        <Text
          v-if="editor.draft.value.detached.includes(group.id)"
          size="sm"
          class="border-b border-line px-4 py-3 last:border-b-0"
        >
          移出其他作品中的出场
        </Text>
        <WikiSaveRow v-for="row in group.rows" :key="row.id" :row="row" />
      </Stack>
    </Stack>
  </Stack>
</template>
