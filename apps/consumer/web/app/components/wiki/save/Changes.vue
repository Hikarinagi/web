<script setup lang="ts">
  import { Button, Empty, Panel, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { reviewOf, type ReviewGroup } from '~/features/wiki/editor/review'

  defineOptions({ name: 'WikiSaveChanges' })

  const editor = inject(ENTRY_EDITOR)!
  const groups = computed(() =>
    reviewOf(
      editor.draft.value,
      editor.members.value,
      editor.definitions.value,
      editor.statements.value,
    ),
  )
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
  <Empty v-if="!groups.length" title="没有修改" />
  <Stack v-else gap="md">
    <Panel v-for="group in groups" :key="group.id" :title="titleOf(group)" :level="3">
      <template v-if="group.created" #actions>
        <Button variant="ghost" tone="neutral" size="sm" @click="editor.uncreate(group.id)">
          取消新建
        </Button>
      </template>
      <Stack gap="none" align="stretch" class="divide-y divide-line">
        <Text v-if="editor.draft.value.detached.includes(group.id)" size="sm" class="py-2">
          移出其他作品中的出场
        </Text>
        <WikiSaveRow v-for="row in group.rows" :key="row.id" :row="row" />
      </Stack>
    </Panel>
  </Stack>
</template>
