<script setup lang="ts">
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeCard' })
  const props = defineProps<{
    item: MangaHomePageData['updates']['items'][number]
    rank?: number
    hideStatus?: boolean
  }>()

  const title = computed(() => props.item.name_cn || props.item.name)
  const cover = computed(() => topVotedMedia(props.item.covers))
  const year = computed(() => {
    if (!props.item.publication_date) return null
    const date = new Date(props.item.publication_date)
    return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear()
  })
</script>

<template>
  <NuxtLink :to="`/mangas/${item.id}`" class="group flex min-w-0 shrink-0 flex-col gap-2">
    <div
      class="relative aspect-2/3 overflow-hidden rounded-lg border border-surface bg-surface-100 dark:bg-surface-800"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover object-top"
        preset="medium"
      >
        <template #empty><span /></template>
      </HikariImage>
      <span
        v-if="rank"
        class="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-md text-xs font-bold text-white backdrop-blur-sm"
        :class="rank <= 3 ? 'bg-hikari-primary-500/90' : 'bg-surface-900/75'"
      >
        {{ rank }}
      </span>
      <span
        v-if="!hideStatus && item.serial_status === 'FINISHED'"
        class="absolute top-1.5 right-1.5 rounded bg-surface-900/75 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
      >
        已完结
      </span>
    </div>
    <div class="flex min-w-0 flex-col gap-0.5">
      <p
        class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
      >
        {{ title }}
      </p>
      <p v-if="year" class="text-xs text-muted-color">{{ year }}</p>
    </div>
  </NuxtLink>
</template>
