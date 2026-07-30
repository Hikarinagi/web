<script setup lang="ts">
  import { workPath as toWorkPath } from '#shared/utils/work'
  import type { FeedItemByType } from '~/features/feed/feed'
  import { finishHours, statusVerb } from '~/features/feed/feed'
  import {
    GALGAME_STATUS_ICON,
    LIGHT_NOVEL_STATUS_ICON,
    MANGA_STATUS_ICON,
  } from '~/features/rate/status-icon'

  const props = defineProps<{
    item:
      | FeedItemByType<'galgame_status'>
      | FeedItemByType<'light_novel_status'>
      | FeedItemByType<'manga_status'>
  }>()

  const verb = computed(() => statusVerb(props.item.type, props.item.status))
  const icon = computed(() => {
    const icons =
      props.item.type === 'galgame_status'
        ? GALGAME_STATUS_ICON
        : props.item.type === 'light_novel_status'
          ? LIGHT_NOVEL_STATUS_ICON
          : MANGA_STATUS_ICON
    return icons[props.item.status]
  })
  const hours = computed(() =>
    'time_to_finish_minutes' in props.item ? finishHours(props.item.time_to_finish_minutes) : null,
  )
  const timeLabel = computed(() => (props.item.type === 'galgame_status' ? '总游玩' : '总阅读'))
  const workPath = computed(() => toWorkPath(props.item.work_ref.work_type, props.item.work_ref.id))
</script>

<template>
  <p class="flex items-center gap-1.5 text-[15px] text-color">
    <component :is="icon" class="mt-0.5 size-4 shrink-0 text-primary" />
    <span>
      {{ verb }}
      <WorkCardTrigger :work-type="item.work_ref.work_type" :work-id="item.work_ref.id">
        <NuxtLink :to="workPath" class="font-medium transition-colors hover:text-primary">
          《{{ item.work_ref.title }}》
        </NuxtLink>
      </WorkCardTrigger>
      <span v-if="hours" class="text-muted-color">· {{ timeLabel }} {{ hours }}</span>
    </span>
  </p>
</template>
