<script setup lang="ts">
  import { Tabs, TabsList, TabsTrigger, Tag } from '@hina-ui/vue'
  import type { EditorPart } from '~/features/wiki/editor/parts'

  defineOptions({ name: 'WikiEditorParts' })

  const props = defineProps<{
    entry: number
    parts: readonly EditorPart[]
    current: string
    changes: Record<string, number>
    totals: Record<string, number>
  }>()

  function open(part: string | undefined) {
    if (part) void navigateTo(`/entries/${props.entry}/edit/${part}`)
  }
</script>

<template>
  <Tabs :model-value="current" variant="soft" size="sm" @update:model-value="open">
    <TabsList label="条目的各部分">
      <TabsTrigger v-for="part in parts" :key="part.key" :value="part.key">
        {{ part.label }}
        <Tag v-if="changes[part.key]" size="sm" tone="accent">{{ changes[part.key] }} 处修改</Tag>
        <Tag v-else-if="totals[part.key]" size="sm" tone="neutral">{{ totals[part.key] }}</Tag>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
