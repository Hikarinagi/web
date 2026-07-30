<script setup lang="ts">
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
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-[72px] w-32 flex-none overflow-hidden rounded bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-cover"
      >
        <template #empty>
          <HikariContentNodesEntityCardCoverFallback :icon="Newspaper" :size="28" />
        </template>
        <template #error>
          <HikariContentNodesEntityCardCoverFallback :icon="Newspaper" :size="28" />
        </template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <span
          class="line-clamp-2 text-[15px] leading-snug font-semibold text-(--editor-text-color)"
        >
          {{ title }}
        </span>
        <div class="flex items-center gap-2.5 text-[11px] text-(--editor-text-muted)">
          <UserName v-if="author" :user="author" :handle="false" class="font-medium" />
          <span v-if="meta">{{ meta }}</span>
        </div>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>
