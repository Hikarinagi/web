<script setup lang="ts">
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
  <Drawer v-model:visible="visible" position="left" class="w-full! max-w-120!">
    <template #header>
      <div class="min-w-0">
        <p class="truncate text-xs text-muted-color">{{ subtitle }}</p>
        <h2 class="truncate text-base font-semibold">{{ title }}</h2>
      </div>
    </template>

    <div class="min-h-0">
      <HikariReaderCatalogTableOfContents
        v-if="items.length"
        :items="items"
        :active-href="activeHref"
        @select="emit('select', $event)"
      />
      <p v-else class="px-2 py-3 text-sm text-muted-color">目录加载中</p>
    </div>
  </Drawer>
</template>
