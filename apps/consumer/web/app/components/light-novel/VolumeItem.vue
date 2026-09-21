<script setup lang="ts">
  import { AspectRatio, Progress, Stack, Tag, Text, VisuallyHidden } from '@hina-ui/vue'
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
  <NuxtLink :to="to" class="group block hn-interactive rounded-lg hn-press-none">
    <AspectRatio
      :ratio="7 / 10"
      class="relative overflow-hidden rounded-lg bg-subtle ring-1"
      :class="active ? 'ring-2 ring-accent' : 'ring-line'"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover"
        :processing="{ width: 360, quality: 88, fit: 'cover' }"
      >
        <template #empty><VisuallyHidden /></template>
        <template #error><VisuallyHidden /></template>
      </HikariImage>
      <Tag
        v-if="volume.online_reading_available"
        variant="solid"
        tone="neutral"
        size="sm"
        class="absolute top-1.5 left-1.5 backdrop-blur-sm"
      >
        {{ volume.online_reading_is_collection ? 'EPUB 合集' : 'EPUB' }}
      </Tag>
      <Progress
        v-if="progress && pct > 0"
        :value="pct"
        size="sm"
        :tone="done ? 'success' : 'accent'"
        class="absolute inset-x-0 bottom-0"
      />
    </AspectRatio>

    <Stack gap="none" class="mt-2">
      <Text
        size="sm"
        weight="semibold"
        truncate
        class="transition-colors"
        :class="active ? 'text-accent-text' : 'group-hover:text-accent-text'"
      >
        {{ label ? `${label}${active ? ' · 本卷' : ''}` : active ? '本卷' : title }}
      </Text>
      <Text v-if="tracked" size="xs" truncate :class="done ? 'text-success-text' : 'text-muted'">
        {{ stateLabel }}
      </Text>
      <Text v-else-if="publicationDate" size="xs" tone="muted" truncate>
        {{ publicationDate }}
      </Text>
    </Stack>
  </NuxtLink>
</template>
