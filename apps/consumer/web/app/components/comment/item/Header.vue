<script setup lang="ts">
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
  <header class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
    <UserName :user="author" fallback="已注销" class="font-semibold text-color" />
    <UserBadges :user="author" />
    <Tag v-if="isAuthor" value="作者" :pt="{ root: { class: 'text-xs!' } }" />
    <Tag
      v-if="comment.is_pinned"
      value="置顶"
      severity="secondary"
      :pt="{ root: { class: 'text-xs!' } }"
    >
      <template #icon><Pin class="size-3" /></template>
    </Tag>
    <span v-if="replyTo" class="inline-flex items-center gap-1 text-xs text-muted-color">
      <CornerDownRight class="size-3 shrink-0" />
      <span class="inline-flex items-center gap-1">
        回复
        <UserName
          :user="replyTo"
          :handle="false"
          fallback="已注销"
          class="font-medium text-color"
        />
      </span>
    </span>
    <span class="text-xs text-muted-color">· {{ timeFromNow(comment.created_at) }}</span>
    <span v-if="isEdited" class="text-xs text-surface-400">已编辑</span>
  </header>
</template>
