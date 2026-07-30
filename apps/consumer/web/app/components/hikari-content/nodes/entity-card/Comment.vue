<script setup lang="ts">
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
  <aside
    class="relative my-[0.8em] block overflow-hidden rounded-(--editor-panel-radius) border-s-2 border-(--editor-toolbar-item-hover) bg-(--editor-toolbar-bg) px-3.5 py-2.5 text-inherit"
    data-card-type="comment"
    :data-comment-id="id ?? ''"
  >
    <div v-if="isDeleted || !summary" class="flex items-center gap-2 text-(--editor-text-muted)">
      <MessageSquareQuote :size="15" class="flex-none" />
      <span class="text-[13px]">{{ isDeleted ? '该评论已删除' : '评论不可用' }}</span>
    </div>
    <template v-else>
      <div class="flex items-center gap-1.5 text-[12px] text-(--editor-text-muted)">
        <HikariImage
          v-if="avatarSrc"
          :src="avatarSrc"
          :alt="displayName(author, '')"
          :processing="false"
          :skeleton="false"
          class="size-4 flex-none overflow-hidden rounded-full"
          image-class="size-full object-cover"
        >
          <template #empty><span /></template>
          <template #error><span /></template>
        </HikariImage>
        <UserName :user="author" :handle="false" class="font-medium text-(--editor-text-color)" />
      </div>
      <div v-if="contentJson" class="hikari-content hikari-content--comment mt-1 text-[13px]">
        <HikariContentDispatch :node="contentJson" />
      </div>
      <p
        v-else-if="excerpt"
        class="mt-1 line-clamp-3 text-[13px] leading-relaxed whitespace-pre-wrap text-(--editor-text-color)"
      >
        {{ excerpt }}
      </p>
    </template>
  </aside>
</template>
