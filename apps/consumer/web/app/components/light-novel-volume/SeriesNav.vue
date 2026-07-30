<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import {
    getLightNovelVolumeCover,
    getLightNovelVolumeLabel,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeSeriesNav' })
  type Sibling = LightNovelVolumePageData['volumes'][number]
  defineProps<{ previous?: Sibling; next?: Sibling }>()

  const labelOf = (v: Sibling) => getLightNovelVolumeLabel(v) || getLightNovelVolumeTitle(v)
</script>

<template>
  <div v-if="previous || next" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <NuxtLink
      v-if="previous"
      :to="`/light-novel-volumes/${previous.id}`"
      class="group flex min-w-0 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
    >
      <ChevronLeft
        class="size-5 shrink-0 text-surface-400 transition-colors group-hover:text-hikari-primary-600 dark:group-hover:text-hikari-primary-400"
      />
      <HikariImage
        :src="getLightNovelVolumeCover(previous)"
        :alt="getLightNovelVolumeTitle(previous)"
        class="aspect-7/10 w-9 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
        image-class="object-cover"
        :processing="{ width: 80, quality: 80 }"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <div class="min-w-0 flex-1">
        <p class="truncate text-xs text-surface-500 dark:text-surface-400">
          上一卷 · {{ labelOf(previous) }}
        </p>
        <p class="truncate text-sm font-medium text-surface-900 dark:text-surface-0">
          {{ getLightNovelVolumeTitle(previous) }}
        </p>
      </div>
    </NuxtLink>
    <div v-else class="hidden sm:block" />

    <NuxtLink
      v-if="next"
      :to="`/light-novel-volumes/${next.id}`"
      class="group flex min-w-0 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
    >
      <div class="order-1 min-w-0 flex-1 text-right">
        <p class="truncate text-xs text-surface-500 dark:text-surface-400">
          下一卷 · {{ labelOf(next) }}
        </p>
        <p class="truncate text-sm font-medium text-surface-900 dark:text-surface-0">
          {{ getLightNovelVolumeTitle(next) }}
        </p>
      </div>
      <HikariImage
        :src="getLightNovelVolumeCover(next)"
        :alt="getLightNovelVolumeTitle(next)"
        class="order-2 aspect-7/10 w-9 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
        image-class="object-cover"
        :processing="{ width: 80, quality: 80 }"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <ChevronRight
        class="order-3 size-5 shrink-0 text-surface-400 transition-colors group-hover:text-hikari-primary-600 dark:group-hover:text-hikari-primary-400"
      />
    </NuxtLink>
  </div>
</template>
