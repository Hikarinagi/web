<script setup lang="ts">
  import { Inline, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
  import { MessageSquareQuote } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'HikariContentNodesEntityCardComment' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.comment_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.comments.get(id.value) ?? null) : null,
  )
  const isDeleted = computed(() => summary.value?.is_deleted ?? false)
  const author = computed(() => summary.value?.author ?? null)
  const avatarSrc = computed(() => author.value?.avatar?.src ?? null)
  const excerpt = computed(() => summary.value?.excerpt ?? null)
  // content_json 内的 @mention / emoji 由外层 HikariContent 提供的 summaries/emojiSets
  // 解析(详情端点已把被引用评论的内部 refs 并进顶层)。
  const contentJson = computed(() => (summary.value?.content_json ?? null) as EditorNode | null)
</script>

<template>
  <Stack
    as="aside"
    gap="none"
    class="relative my-hikari-node overflow-hidden rounded-(--editor-panel-radius) border-s-2 border-(--editor-toolbar-item-hover) bg-(--editor-toolbar-bg) px-3.5 py-2.5 text-inherit"
    data-card-type="comment"
    :data-comment-id="id ?? ''"
  >
    <Inline
      v-if="isDeleted || !summary"
      gap="sm"
      align="center"
      :wrap="false"
      class="text-(--editor-text-muted)"
    >
      <MessageSquareQuote class="size-3.75 flex-none" />
      <Text as="span" size="sm">{{ isDeleted ? '该评论已删除' : '评论不可用' }}</Text>
    </Inline>
    <template v-else>
      <Inline
        gap="none"
        align="center"
        :wrap="false"
        class="gap-1.5 text-xs text-(--editor-text-muted)"
      >
        <HikariImage
          v-if="avatarSrc"
          :src="avatarSrc"
          :alt="displayName(author, '')"
          :processing="false"
          :skeleton="false"
          class="size-4 flex-none overflow-hidden rounded-full"
          image-class="size-full object-cover"
        >
          <template #empty><VisuallyHidden /></template>
          <template #error><VisuallyHidden /></template>
        </HikariImage>
        <UserName :user="author" :handle="false" class="font-medium text-(--editor-text-color)" />
      </Inline>
      <Stack
        v-if="contentJson"
        gap="none"
        class="hikari-content hikari-content--comment mt-1 text-sm"
      >
        <HikariContentDispatch :node="contentJson" />
      </Stack>
      <Text
        v-else-if="excerpt"
        as="p"
        size="sm"
        class="mt-1 line-clamp-3 leading-relaxed whitespace-pre-wrap text-(--editor-text-color)"
      >
        {{ excerpt }}
      </Text>
    </template>
  </Stack>
</template>
