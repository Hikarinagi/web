<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { BookOpen } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta, yearOf } from './format'
  import { workCardTone } from './tone'

  defineOptions({ name: 'HikariContentNodesEntityCardLightNovelVolume' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.light_novel_volume_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.light_novel_volumes.get(id.value) ?? null) : null,
  )
  const href = computed(() =>
    summary.value ? entityHref('light_novel_volume', summary.value.id) : null,
  )
  const title = computed(() => {
    const s = summary.value
    if (!s) return '未命名'
    return (
      s.name_cn ||
      s.name ||
      s.volume_label ||
      (s.volume_number != null ? `第 ${s.volume_number} 卷` : '未命名')
    )
  })
  const volumeTag = computed(() => {
    if (summary.value?.volume_label) return summary.value.volume_label
    const n = summary.value?.volume_number
    return typeof n === 'number' ? `第 ${n} 卷` : null
  })
  const meta = computed(() =>
    joinMeta(['轻小说卷', volumeTag.value, yearOf(summary.value?.publication_date)]),
  )
  const cover = computed(() => summary.value?.top_cover ?? null)
  const hasBackdrop = computed(() => !!cover.value)
  const nsfw = computed(() => summary.value?.nsfw ?? false)
  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(() => shouldBlockNsfw(nsfw.value))
  const tone = computed(() => workCardTone(hasBackdrop.value))
</script>

<template>
  <HikariContentNodesEntityCardContainer
    v-if="!blocked"
    :id="id"
    type="light_novel_volume"
    id-attr="data-light-novel-volume-id"
    :href="href"
  >
    <HikariContentNodesEntityCardBackdrop v-if="hasBackdrop" :src="cover ?? undefined" />
    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-25 w-18 flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover) shadow-hikari-cover-xs"
        image-class="size-full object-cover"
      >
        <template #empty><HikariContentNodesEntityCardCoverFallback :icon="BookOpen" /></template>
        <template #error><HikariContentNodesEntityCardCoverFallback :icon="BookOpen" /></template>
      </HikariImage>
      <Stack gap="none" class="min-w-0 flex-1 gap-1">
        <Text as="span" size="md" truncate :class="cn('font-bold', tone.title)">{{ title }}</Text>
        <Text v-if="summary?.series_name" as="span" size="xs" truncate :class="tone.subtitle">
          {{ summary.series_name }}
        </Text>
        <Text v-if="meta" as="span" size="xs" :class="cn('tracking-wide', tone.meta)">
          {{ meta }}
        </Text>
      </Stack>
    </Inline>
  </HikariContentNodesEntityCardContainer>
</template>
