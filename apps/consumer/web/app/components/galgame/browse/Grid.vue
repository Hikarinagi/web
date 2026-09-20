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
  <CreatorEmpty
    v-else
    :icon="GamepadDirectional"
    text="没有找到符合条件的作品，换一个关键词再试试"
  />
</template>
