<script setup lang="ts">
  import { Card, Grid, Heading, Inline, Stack, Statistic, Text, VisuallyHidden } from '@hina-ui/vue'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import { readSpan, readTime } from '~/features/light-novel-reader/end'
  import {
    getLightNovelTitle,
    getLightNovelVolumeCover,
    getLightNovelVolumeLabel,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderEndSummary' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { end, highlights, bookmarks } = useReader()
  const { stats } = end

  const title = computed(() => getLightNovelVolumeTitle(props.data.volume))
  const lead = computed(() => {
    const label = getLightNovelVolumeLabel(props.data.volume)
    const started = stats.value?.started_at
    return [
      getLightNovelTitle(props.data.light_novel),
      label && label !== title.value ? label : null,
      started ? readSpan(started) : null,
    ]
      .filter(Boolean)
      .join(' · ')
  })
  const cells = computed(() => [
    {
      label: '阅读时长',
      value: stats.value ? readTime(stats.value.read_time) : null,
      loading: stats.value === undefined,
    },
    { label: '高亮', value: highlights.entries.value.length, loading: false },
    {
      label: '笔记',
      value: highlights.entries.value.filter(entry => entry.note).length,
      loading: false,
    },
    { label: '书签', value: bookmarks.entries.value.length, loading: false },
  ])
</script>

<template>
  <Stack gap="lg">
    <Inline gap="lg" align="start" :wrap="false">
      <HikariImage
        :src="getLightNovelVolumeCover(data.volume)"
        :alt="title"
        class="aspect-7/10 w-26 shrink-0 rounded-md bg-subtle"
        image-class="object-cover"
        :processing="{ width: 208, quality: 80 }"
      >
        <template #empty><VisuallyHidden /></template>
        <template #error><VisuallyHidden /></template>
      </HikariImage>
      <Stack gap="xs" class="min-w-0 pt-2">
        <Heading :level="2">《{{ title }}》已读完</Heading>
        <Text size="sm" tone="muted">{{ lead }}</Text>
      </Stack>
    </Inline>
    <Grid :cols="2" gap="sm" class="@xl:grid-cols-4">
      <Card v-for="cell in cells" :key="cell.label" data-density="compact">
        <Statistic :label="cell.label" :value="cell.value" :loading="cell.loading" size="sm" />
      </Card>
    </Grid>
  </Stack>
</template>
