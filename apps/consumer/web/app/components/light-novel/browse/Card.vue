<script setup lang="ts">
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'
  import { overlayText, subText, titleOf } from '~/features/light-novel/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelBrowseCard' })
  const props = defineProps<{ item: LightNovelsBrowsePageData['list']['items'][number] }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
  const overlay = computed(() => overlayText(props.item))
</script>

<template>
  <NuxtLink :to="`/light-novels/${item.id}`" class="group flex min-w-0 flex-col gap-2">
    <div
      class="relative aspect-2/3 overflow-hidden rounded-lg border border-surface-200 bg-surface-100 transition-colors duration-150 ease-out group-hover:border-surface-300 dark:border-surface-800 dark:bg-surface-800 dark:group-hover:border-surface-700"
    >
      <HikariImage
        v-if="cover"
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="size-full object-cover object-top"
        :processing="{ quality: 82 }"
        :lazy="true"
      />
      <div v-else class="size-full" />
      <span
        v-if="overlay"
        class="absolute right-1.5 bottom-1.5 rounded-md bg-surface-950/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
      >
        {{ overlay }}
      </span>
    </div>
    <div class="flex min-w-0 flex-col gap-1">
      <p
        class="truncate text-sm font-semibold text-surface-900 transition-colors duration-150 ease-out group-hover:text-primary dark:text-surface-100"
      >
        {{ title }}
      </p>
      <p class="truncate text-xs font-bold text-surface-500 dark:text-surface-400">
        {{ subText(item) }}
      </p>
    </div>
  </NuxtLink>
</template>
