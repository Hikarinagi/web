<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
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
    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
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
      <Stack gap="none" class="min-w-0 flex-1 gap-1">
        <Text as="span" weight="semibold" truncate class="text-(--editor-text-color)">
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
