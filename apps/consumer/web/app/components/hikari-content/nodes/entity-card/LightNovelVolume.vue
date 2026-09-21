<script setup lang="ts">
  import { BookOpen } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta, yearOf } from './format'

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
    <div class="relative z-1 flex items-center gap-3.5">
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
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span
          :class="[
            'truncate text-md font-bold',
            hasBackdrop ? 'text-white text-shadow-hikari-on-image' : 'text-(--editor-text-color)',
          ]"
        >
          {{ title }}
        </span>
        <span
          v-if="summary?.series_name"
          :class="[
            'truncate text-xs',
            hasBackdrop
              ? 'text-white/78 text-shadow-hikari-on-image'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ summary.series_name }}
        </span>
        <span
          v-if="meta"
          :class="[
            'text-xs tracking-wide',
            hasBackdrop
              ? 'text-white/65 text-shadow-hikari-on-image'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ meta }}
        </span>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>
