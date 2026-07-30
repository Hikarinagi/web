<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import {
    getLightNovelVolumeCover,
    getLightNovelVolumeLabel,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  type VolumeProgress = NonNullable<LightNovelPageData['progress']>['progresses'][number]

  const props = defineProps<{
    volume: LightNovelPageData['volumes'][number]
    progress?: VolumeProgress | null
    tracked?: boolean
    active?: boolean
  }>()

  const cover = computed(() => getLightNovelVolumeCover(props.volume))
  const title = computed(() => getLightNovelVolumeTitle(props.volume))
  const label = computed(() => getLightNovelVolumeLabel(props.volume))
  const publicationDate = computed(() =>
    timeFormat(props.volume.publication_date, TimeFormatEnum.YYYY_MM_DD),
  )
  const to = computed(() => `/light-novel-volumes/${props.volume.id}`)

  const pct = computed(() => Math.min(100, Math.max(0, props.progress?.percentage ?? 0)))
  const done = computed(() => pct.value >= 99.5)
  const stateLabel = computed(() => {
    if (!props.progress || pct.value <= 0) return '没有读过'
    if (done.value) return '已读完'
    return `已读 ${Math.round(pct.value)}%`
  })
</script>

<template>
  <NuxtLink :to="to" class="group block outline-none">
    <div
      class="relative aspect-7/10 overflow-hidden rounded-lg bg-surface-100 transition-shadow duration-200 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-primary dark:bg-surface-900"
      :class="active ? 'ring-2 ring-primary' : 'ring-1 ring-surface-200 dark:ring-surface-800'"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover"
        :processing="{ width: 360, quality: 88, fit: 'cover' }"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <span
        v-if="volume.online_reading_available"
        class="absolute top-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
      >
        {{ volume.online_reading_is_collection ? 'EPUB 合集' : 'EPUB' }}
      </span>
      <div v-if="progress && pct > 0" class="absolute inset-x-0 bottom-0 h-1 bg-black/35">
        <div
          class="h-full"
          :class="done ? 'bg-emerald-500' : 'bg-primary'"
          :style="{ width: `${pct}%` }"
        />
      </div>
    </div>
    <p
      class="mt-2 truncate text-sm font-semibold"
      :class="
        active
          ? 'text-hikari-primary-600 dark:text-hikari-primary-400'
          : 'text-surface-950 dark:text-surface-0'
      "
    >
      {{ label ? `${label}${active ? ' · 本卷' : ''}` : active ? '本卷' : title }}
    </p>
    <p
      v-if="tracked"
      class="truncate text-xs"
      :class="
        done ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-500 dark:text-surface-400'
      "
    >
      {{ stateLabel }}
    </p>
    <p v-else-if="publicationDate" class="truncate text-xs text-surface-500 dark:text-surface-400">
      {{ publicationDate }}
    </p>
  </NuxtLink>
</template>
