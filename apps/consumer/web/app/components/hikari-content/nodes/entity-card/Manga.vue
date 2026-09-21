<script setup lang="ts">
  import { BookImage } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta, yearOf } from './format'

  defineOptions({ name: 'HikariContentNodesEntityCardManga' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.manga_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.mangas.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('manga', summary.value.id) : null))
  const title = computed(() => summary.value?.name_cn || summary.value?.name || '未命名')
  const subtitle = computed(() =>
    summary.value?.name_cn && summary.value.name !== summary.value.name_cn
      ? summary.value.name
      : null,
  )
  const meta = computed(() =>
    joinMeta(['漫画', yearOf(summary.value?.publication_date), summary.value?.author_name]),
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
    type="manga"
    id-attr="data-manga-id"
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
        <template #empty><HikariContentNodesEntityCardCoverFallback :icon="BookImage" /></template>
        <template #error><HikariContentNodesEntityCardCoverFallback :icon="BookImage" /></template>
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
          v-if="subtitle"
          :class="[
            'truncate text-sm',
            hasBackdrop
              ? 'text-white/78 text-shadow-hikari-on-image'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ subtitle }}
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
