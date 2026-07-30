<script setup lang="ts">
  import { GamepadDirectional } from '@lucide/vue'
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'

  defineOptions({ name: 'GalgameBrowseGrid' })
  defineProps<{ list: GalgamesBrowsePageData['list']; pending?: boolean }>()
</script>

<template>
  <LoadingOverlay
    v-if="list.items.length"
    :loading="pending"
    label="正在加载作品"
    content-class="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6"
  >
    <GalgameBrowseCard v-for="item in list.items" :key="item.id" :item="item" />
  </LoadingOverlay>
  <div
    v-else
    class="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-surface-200 px-6 py-12 text-center dark:border-surface-800"
  >
    <GamepadDirectional class="size-7 text-surface-400 dark:text-surface-500" />
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-surface-700 dark:text-surface-200">
        没有找到符合条件的作品
      </p>
      <p class="text-xs text-surface-500 dark:text-surface-400">换一个关键词再试试</p>
    </div>
  </div>
</template>
