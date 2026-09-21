<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="none">
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
    <Text v-else-if="comment.is_deleted" as="p" size="sm" tone="muted" class="italic">
      该评论已删除
    </Text>
    <template v-else>
      <HikariContent
        v-if="comment.content_json"
        :doc="comment.content_json"
        :summaries="thread.summaries.value"
        :emoji-sets="thread.emojiSets.value"
        preset="comment"
      />
      <Inline v-if="comment.attachments.length" gap="none" class="mt-2 max-w-102 gap-1.5">
        <HikariImage
          v-for="a in comment.attachments"
          :key="a.media.id"
          :src="a.media"
          :alt="''"
          preview
          class="size-33 shrink-0 overflow-hidden rounded-lg"
          image-class="size-full object-cover"
        />
      </Inline>
    </template>
  </Stack>
</template>
