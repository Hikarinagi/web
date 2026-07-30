<script setup lang="ts">
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'

  defineOptions({ name: 'LightNovelBrowseGrid' })
  defineProps<{ list: LightNovelsBrowsePageData['list']; pending?: boolean }>()
  const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <LoadingOverlay
    v-if="list.items.length"
    :loading="pending"
    label="正在加载作品"
    content-class="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6"
  >
    <LightNovelBrowseCard v-for="item in list.items" :key="item.id" :item="item" />
  </LoadingOverlay>
  <div
    v-else
    class="flex items-center justify-between gap-3 rounded-lg border border-dashed border-surface-200 px-4 py-3 dark:border-surface-800"
  >
    <p class="text-sm text-surface-600 dark:text-surface-300">没有符合条件的轻小说</p>
    <Button label="清除筛选" text severity="secondary" size="small" @click="emit('clear')" />
  </div>
</template>
