<script setup lang="ts">
  import { Drawer, Text } from '@hina-ui/vue'
  import type { TocEntry } from '@ritojs/core'

  defineProps<{
    title: string
    subtitle: string
    items: readonly TocEntry[]
    activeHref: string | null
  }>()

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    select: [entry: TocEntry]
  }>()
</script>

<template>
  <Drawer v-model:open="visible" side="start" size="lg" :title="title" :description="subtitle">
    <template #content>
      <HikariReaderCatalogTableOfContents
        v-if="items.length"
        :items="items"
        :active-href="activeHref"
        @select="emit('select', $event)"
      />
      <Text v-else size="sm" tone="muted">目录加载中</Text>
    </template>
  </Drawer>
</template>
