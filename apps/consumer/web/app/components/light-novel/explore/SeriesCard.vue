<script setup lang="ts">
  import { titleOf, yearOf, type SeriesCardItem } from '~/features/light-novel/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelExploreSeriesCard' })
  const props = defineProps<{ item: SeriesCardItem; badge?: string }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
  const year = computed(() => yearOf(props.item))
</script>

<template>
  <NuxtLink :to="`/light-novels/${item.id}`" class="group flex shrink-0 flex-col gap-2">
    <div
      class="relative aspect-7/10 overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover object-top"
        preset="medium"
      />
      <span
        v-if="badge"
        class="absolute top-1.5 left-1.5 rounded bg-surface-900/75 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
      >
        {{ badge }}
      </span>
    </div>
    <div class="flex min-w-0 flex-col gap-0.5">
      <p
        class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
      >
        {{ title }}
      </p>
      <p v-if="year" class="text-xs text-surface-500 dark:text-surface-400">{{ year }}</p>
    </div>
  </NuxtLink>
</template>
