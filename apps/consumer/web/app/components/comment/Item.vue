<script setup lang="ts">
  import { ChevronRight, ChevronUp } from '@lucide/vue'
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'
  import type { CommentItem, CommentNode } from '~/features/comment/comment'

  defineOptions({ name: 'CommentItem' })

  const props = withDefaults(
    defineProps<{
      comment: CommentItem | CommentNode
      authorId?: number | null
      isReply?: boolean
    }>(),
    { authorId: null, isReply: false },
  )

  const thread = inject(COMMENT_THREAD_KEY)!

  const author = computed(() => props.comment.author)
  const children = computed(() => ('children' in props.comment ? props.comment.children : []))
  // 删除态的回复子评论一律不显示
  const visibleChildren = computed(() => children.value.filter(c => !c.is_deleted))
  const childTotal = computed(() =>
    'child_total' in props.comment ? props.comment.child_total : 0,
  )
  const hasMoreReplies = computed(() => childTotal.value > children.value.length)
  const remainingReplies = computed(() => childTotal.value - children.value.length)
  const hasExpanded = computed(() => thread.expandedIds.value.has(props.comment.id))
  const repliesLoading = computed(() => thread.repliesLoading.value.has(props.comment.id))
  const editing = computed(() => thread.editingId.value === props.comment.id)
  const highlighted = computed(() => thread.focusedId.value === props.comment.id)
</script>

<template>
  <article
    :id="`comment-${comment.id}`"
    class="flex scroll-mt-24 items-start rounded-lg transition-shadow duration-700"
    :class="[isReply ? 'gap-2.5' : 'gap-3.5', highlighted ? 'ring-2 ring-primary-400/60' : '']"
  >
    <Avatar
      :user="author"
      card
      shape="circle"
      class="shrink-0"
      :class="isReply ? 'size-8!' : 'size-10!'"
    />

    <div class="min-w-0 flex-1">
      <div class="flex flex-col gap-1.5">
        <CommentItemHeader :comment="comment" :author-id="authorId" />
        <CommentItemBody :comment="comment" :editing="editing" />
        <CommentItemActions
          v-if="!comment.is_deleted && !editing"
          :comment="comment"
          :author-id="authorId"
          :is-reply="isReply"
        />
      </div>

      <div v-if="!isReply && (visibleChildren.length || hasMoreReplies)" class="mt-3 space-y-3">
        <CommentItem
          v-for="child in visibleChildren"
          :key="child.id"
          :comment="child"
          :author-id="authorId"
          is-reply
        />
        <div v-if="hasMoreReplies || hasExpanded" class="flex items-center gap-3">
          <Button
            v-if="hasMoreReplies"
            text
            size="small"
            :loading="repliesLoading"
            class="gap-0.5! text-xs! text-muted-color! hover:text-color!"
            @click="thread.expandReplies(comment as CommentItem)"
          >
            {{
              hasExpanded
                ? `继续展开剩余 ${remainingReplies} 条回复`
                : `共 ${childTotal} 条回复,点击查看`
            }}
            <ChevronRight class="size-3.5" />
          </Button>
          <Button
            v-if="hasExpanded"
            text
            size="small"
            class="gap-0.5! text-xs! text-muted-color! hover:text-color!"
            @click="thread.collapseReplies(comment.id)"
          >
            收起
            <ChevronUp class="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </article>
</template>
