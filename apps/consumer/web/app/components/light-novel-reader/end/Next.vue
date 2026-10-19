<script setup lang="ts">
  import { Button, Card, Inline, Stack, Tag, Text, VisuallyHidden } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import {
    getLightNovelVolumeCover,
    getLightNovelVolumeLabel,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderEndNext' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { analytics } = useReader()
  const next = computed(() => {
    const index = props.data.volumes.findIndex(volume => volume.id === props.data.volume.id)
    return index >= 0 ? props.data.volumes[index + 1] : undefined
  })
  const name = computed(() => {
    if (!next.value) return ''
    const label = getLightNovelVolumeLabel(next.value)
    const title = getLightNovelVolumeTitle(next.value)
    return label && label !== title ? [label, title].join(String.fromCharCode(12288)) : title
  })
  const resume = computed(() => {
    const entry = props.data.reader?.progress.progresses.find(
      item => item.volume_id === next.value?.id,
    )
    return Boolean(entry && !entry.finished && entry.percentage > 0)
  })
  const target = computed(() =>
    next.value
      ? `/light-novel-volumes/${next.value.id}/read${resume.value ? '' : '?from=start'}`
      : '',
  )
</script>

<template>
  <Card v-if="next">
    <Inline gap="md" align="center" :wrap="false">
      <HikariImage
        :src="getLightNovelVolumeCover(next)"
        :alt="getLightNovelVolumeTitle(next)"
        class="aspect-7/10 w-13.5 shrink-0 rounded bg-subtle"
        image-class="object-cover"
        :processing="{ width: 108, quality: 80 }"
      >
        <template #empty><VisuallyHidden /></template>
        <template #error><VisuallyHidden /></template>
      </HikariImage>
      <Stack gap="none" class="min-w-0 flex-1">
        <Text size="xs" tone="faint">下一卷</Text>
        <Text weight="medium" class="line-clamp-2">{{ name }}</Text>
      </Stack>
      <Button
        v-if="next.online_reading_available"
        :as="NuxtLink"
        :to="target"
        class="shrink-0"
        @click="analytics.track('next', { to: next.id, resume })"
      >
        继续阅读
        <template #trailing><ChevronRight aria-hidden="true" /></template>
      </Button>
      <Tag v-else class="shrink-0">暂无 EPUB</Tag>
    </Inline>
  </Card>
</template>
