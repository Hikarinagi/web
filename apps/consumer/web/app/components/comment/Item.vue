<script setup lang="ts">
  import { Button, Flex, Inline, Stack } from '@hina-ui/vue'
  import { ChevronRight, ChevronUp } from '@lucide/vue'
  import { cn } from '~/utils/cn'
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
  <Flex
    :id="`comment-${comment.id}`"
    as="article"
    align="start"
    :class="
      cn(
        'scroll-mt-24 rounded-lg transition-shadow duration-700',
        isReply ? 'gap-2.5' : 'gap-3.5',
        highlighted && 'ring-2 ring-accent/60',
      )
    "
  >
    <Avatar :user="author" card class="shrink-0" :class="isReply ? 'size-8!' : 'size-10!'" />

    <Stack gap="none" class="min-w-0 flex-1">
      <Stack gap="none" class="gap-1.5">
        <CommentItemHeader :comment="comment" :author-id="authorId" />
        <CommentItemBody :comment="comment" :editing="editing" />
        <CommentItemActions
          v-if="!comment.is_deleted && !editing"
          :comment="comment"
          :author-id="authorId"
          :is-reply="isReply"
        />
      </Stack>

      <Stack
        v-if="!isReply && (visibleChildren.length || hasMoreReplies)"
        gap="none"
        class="mt-3 gap-3"
      >
        <CommentItem
          v-for="child in visibleChildren"
          :key="child.id"
          :comment="child"
          :author-id="authorId"
          is-reply
        />
        <Inline v-if="hasMoreReplies || hasExpanded" :wrap="false">
          <Button
            v-if="hasMoreReplies"
            variant="ghost"
            tone="neutral"
            size="sm"
            :loading="repliesLoading"
            class="text-xs text-muted"
            @click="thread.expandReplies(comment as CommentItem)"
          >
            {{
              hasExpanded
                ? `继续展开剩余 ${remainingReplies} 条回复`
                : `共 ${childTotal} 条回复，点击查看`
            }}
            <template #trailing><ChevronRight /></template>
          </Button>
          <Button
            v-if="hasExpanded"
            variant="ghost"
            tone="neutral"
            size="sm"
            class="text-xs text-muted"
            @click="thread.collapseReplies(comment.id)"
          >
            收起
            <template #trailing><ChevronUp /></template>
          </Button>
        </Inline>
      </Stack>
    </Stack>
  </Flex>
</template>
