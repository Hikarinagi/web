<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { BookImage } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta, yearOf } from './format'
  import { workCardTone } from './tone'

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
  const tone = computed(() => workCardTone(hasBackdrop.value))
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
    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
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
      <Stack gap="none" class="min-w-0 flex-1 gap-1">
        <Text as="span" size="md" truncate :class="cn('font-bold', tone.title)">{{ title }}</Text>
        <Text v-if="subtitle" as="span" size="sm" truncate :class="tone.subtitle">
          {{ subtitle }}
        </Text>
        <Text v-if="meta" as="span" size="xs" :class="cn('tracking-wide', tone.meta)">
          {{ meta }}
        </Text>
      </Stack>
    </Inline>
  </HikariContentNodesEntityCardContainer>
</template>
