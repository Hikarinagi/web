<script setup lang="ts">
  import { MessageSquareText } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta } from './format'

  defineOptions({ name: 'HikariContentNodesEntityCardPost' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.post_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.posts.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('post', summary.value.id) : null))
  const title = computed(() => summary.value?.title ?? '未命名图文')
  const author = computed(() => summary.value?.creator ?? null)
  const meta = computed(() => joinMeta(['图文', summary.value?.top_section_name]))
  const cover = computed(() => summary.value?.top_cover?.src ?? null)
</script>

<template>
  <HikariContentNodesEntityCardContainer :id="id" type="post" id-attr="data-post-id" :href="href">
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="size-16 flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-cover"
      >
        <template #empty>
          <HikariContentNodesEntityCardCoverFallback :icon="MessageSquareText" />
        </template>
        <template #error>
          <HikariContentNodesEntityCardCoverFallback :icon="MessageSquareText" />
        </template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span class="truncate text-[15px] font-semibold text-(--editor-text-color)">
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
