<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { Newspaper } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta } from './format'

  defineOptions({ name: 'HikariContentNodesEntityCardArticle' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.article_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.articles.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('article', summary.value.id) : null))
  const title = computed(() => summary.value?.title ?? '未命名文章')
  const author = computed(() => summary.value?.creator ?? null)
  const meta = computed(() => joinMeta(['文章', summary.value?.top_section_name]))
  const cover = computed(() => summary.value?.cover?.src ?? null)
</script>

<template>
  <HikariContentNodesEntityCardContainer
    :id="id"
    type="article"
    id-attr="data-article-id"
    :href="href"
  >
    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-18 w-32 flex-none overflow-hidden rounded bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-cover"
      >
        <template #empty>
          <HikariContentNodesEntityCardCoverFallback :icon="Newspaper" :size="28" />
        </template>
        <template #error>
          <HikariContentNodesEntityCardCoverFallback :icon="Newspaper" :size="28" />
        </template>
      </HikariImage>
      <Stack gap="none" class="min-w-0 flex-1 gap-1.5">
        <Text
          as="span"
          weight="semibold"
          class="line-clamp-2 leading-snug text-(--editor-text-color)"
        >
          {{ title }}
        </Text>
        <Inline
          gap="none"
          align="center"
          :wrap="false"
          class="gap-2.5 text-xs text-(--editor-text-muted)"
        >
          <UserName v-if="author" :user="author" :handle="false" class="font-medium" />
          <Text v-if="meta" as="span" size="xs" class="text-(--editor-text-muted)">
            {{ meta }}
          </Text>
        </Inline>
      </Stack>
    </Inline>
  </HikariContentNodesEntityCardContainer>
</template>
