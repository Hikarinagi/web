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
    <div v-if="hasBackdrop" class="pointer-events-none absolute inset-0 z-0">
      <HikariImage
        :src="cover"
        alt=""
        :processing="{ blur: 60, brightness: 0.5, width: 600, quality: 75 }"
        :skeleton="false"
        class="size-full"
        image-class="size-full object-cover scale-110"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <span
        class="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0.55)_40%,rgb(0_0_0/0.65)_100%)]"
        aria-hidden="true"
      />
    </div>
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-[100px] w-[72px] flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover) shadow-[0_6px_16px_rgb(0_0_0/0.35)]"
        image-class="size-full object-cover"
      >
        <template #empty><HikariContentNodesEntityCardCoverFallback :icon="BookOpen" /></template>
        <template #error><HikariContentNodesEntityCardCoverFallback :icon="BookOpen" /></template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span
          :class="[
            'truncate text-[17px] font-bold tracking-[-0.01em]',
            hasBackdrop
              ? 'text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.5)]'
              : 'text-(--editor-text-color)',
          ]"
        >
          {{ title }}
        </span>
        <span
          v-if="summary?.series_name"
          :class="[
            'truncate text-xs',
            hasBackdrop
              ? 'text-white/78 [text-shadow:0_1px_4px_rgb(0_0_0/0.45)]'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ summary.series_name }}
        </span>
        <span
          v-if="meta"
          :class="[
            'text-[11px] tracking-[0.02em]',
            hasBackdrop
              ? 'text-white/65 [text-shadow:0_1px_3px_rgb(0_0_0/0.4)]'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ meta }}
        </span>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>
