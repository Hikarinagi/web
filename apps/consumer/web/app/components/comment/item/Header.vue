<script setup lang="ts">
  import { Inline, Tag, Text } from '@hina-ui/vue'
  import { timeFromNow } from '#imports'
  import { CornerDownRight, Pin } from '@lucide/vue'
  import type { CommentItem, CommentNode } from '~/features/comment/comment'

  defineOptions({ name: 'CommentItemHeader' })

  const props = withDefaults(
    defineProps<{ comment: CommentItem | CommentNode; authorId?: number | null }>(),
    { authorId: null },
  )

  const author = computed(() => props.comment.author)
  const isAuthor = computed(() => props.authorId != null && author.value?.id === props.authorId)
  const isEdited = computed(() => !props.comment.is_deleted && props.comment.is_edited)
  // 仅「回复了某条兄弟回复」时非空(回复顶层评论时后端置 null),用于消歧扁平回复列表的指向
  const replyTo = computed(() => props.comment.reply_to_comment?.author ?? null)
</script>

<template>
  <Inline as="header" gap="none" align="center" class="gap-x-2 gap-y-1 text-sm">
    <UserName :user="author" fallback="已注销" class="font-semibold text-fg" />
    <UserBadges :user="author" />
    <Tag v-if="isAuthor" tone="accent">作者</Tag>
    <Tag v-if="comment.is_pinned" tone="neutral">
      <Pin class="size-3" />
      置顶
    </Tag>
    <Inline
      v-if="replyTo"
      as="span"
      gap="none"
      align="center"
      :wrap="false"
      class="gap-1 text-xs text-muted"
    >
      <CornerDownRight class="size-3 shrink-0" />
      <Inline as="span" gap="none" align="center" :wrap="false" class="gap-1">
        回复
        <UserName :user="replyTo" :handle="false" fallback="已注销" class="font-medium text-fg" />
      </Inline>
    </Inline>
    <Text as="span" size="xs" tone="muted">· {{ timeFromNow(comment.created_at) }}</Text>
    <Text v-if="isEdited" as="span" size="xs" tone="faint">已编辑</Text>
  </Inline>
</template>
