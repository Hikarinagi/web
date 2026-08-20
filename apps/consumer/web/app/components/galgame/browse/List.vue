<script setup lang="ts">
  import { GamepadDirectional } from '@lucide/vue'
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'
  import { producerText, titleOf, yearText } from '~/features/galgame/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameBrowseList' })
  defineProps<{ list: GalgamesBrowsePageData['list']; pending?: boolean }>()
</script>

<template>
  <LoadingOverlay
    v-if="list.items.length"
    :loading="pending"
    label="正在加载作品"
    content-class="flex flex-col gap-3"
  >
    <NuxtLink
      v-for="item in list.items"
      :key="item.id"
      :to="`/galgames/${item.id}`"
      class="group flex min-w-0 items-center gap-4 rounded-lg border border-surface-200 bg-surface-0 p-3 transition-colors duration-150 ease-out hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
    >
      <div
        class="aspect-3/4 w-14 shrink-0 overflow-hidden rounded-md border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
      >
        <HikariImage
          :src="topVotedMedia(item.covers)"
          :alt="titleOf(item)"
          class="size-full"
          image-class="size-full object-cover object-top"
          :processing="{ quality: 82 }"
          :lazy="true"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <p
          class="truncate text-sm font-semibold text-surface-900 transition-colors duration-150 ease-out group-hover:text-primary dark:text-surface-100"
        >
          {{ titleOf(item) }}
          <span
            v-if="item.nsfw"
            class="ml-1.5 rounded bg-red-500/10 px-1 py-0.5 align-middle text-[10px] font-bold text-red-500"
          >
            NSFW
          </span>
        </p>
        <p
          v-if="item.origin_title && item.origin_title !== titleOf(item)"
          class="truncate text-xs text-surface-500 dark:text-surface-400"
        >
          {{ item.origin_title }}
        </p>
        <p class="truncate text-xs font-bold text-surface-500 dark:text-surface-400">
          {{ producerText(item) }}
        </p>
      </div>
      <span class="shrink-0 text-xs whitespace-nowrap text-surface-500 dark:text-surface-400">
        {{ yearText(item) }}
      </span>
    </NuxtLink>
  </LoadingOverlay>
  <CreatorEmpty
    v-else
    :icon="GamepadDirectional"
    text="没有找到符合条件的作品，换一个关键词再试试"
  />
</template>
