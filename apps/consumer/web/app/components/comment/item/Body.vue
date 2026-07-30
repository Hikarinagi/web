<script setup lang="ts">
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'
  import type { CommentItem, CommentNode } from '~/features/comment/comment'

  defineOptions({ name: 'CommentItemBody' })

  const props = withDefaults(
    defineProps<{ comment: CommentItem | CommentNode; editing?: boolean }>(),
    { editing: false },
  )

  const thread = inject(COMMENT_THREAD_KEY)!
  const editAttachments = computed(() =>
    props.comment.attachments.map(a => ({
      id: a.media.id,
      src: a.media.src,
      width: a.media.width,
      height: a.media.height,
    })),
  )
</script>

<template>
  <div>
    <CommentEditor
      v-if="editing"
      :initial-content="comment.content_json ?? undefined"
      :document-emoji-sets="thread.emojiSets.value"
      :initial-summaries="thread.summaries.value"
      :initial-attachments="editAttachments"
      submit-label="保存"
      show-cancel
      autofocus
      :submitting="thread.posting.value"
      @submit="
        (json, sets, atts, summaries) => thread.editComment(comment.id, json, sets, atts, summaries)
      "
      @cancel="thread.setEditing(null)"
    />
    <p v-else-if="comment.is_deleted" class="text-sm text-muted-color italic">该评论已删除</p>
    <template v-else>
      <HikariContent
        v-if="comment.content_json"
        :doc="comment.content_json"
        :summaries="thread.summaries.value"
        :emoji-sets="thread.emojiSets.value"
        preset="comment"
      />
      <div v-if="comment.attachments.length" class="mt-2 flex max-w-[408px] flex-wrap gap-1.5">
        <HikariImage
          v-for="a in comment.attachments"
          :key="a.media.id"
          :src="a.media.src"
          :alt="''"
          preview
          class="size-[132px] shrink-0 overflow-hidden rounded-lg"
          image-class="size-full object-cover"
        />
      </div>
    </template>
  </div>
</template>
