<script setup lang="ts">
  import { Button, Inline, Stack, Text, Time } from '@hina-ui/vue'
  import { AlertCircle, Check, CheckCheck, Clock } from '@lucide/vue'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
  import type { DmEmojiSet, ThreadMessage } from '~/features/messages/dm'
  import { hasDoc } from '~/features/messages/dm'

  defineOptions({ name: 'MessagesDmBubble' })
  const props = withDefaults(
    defineProps<{ message: ThreadMessage; emojiSets: DmEmojiSet[]; showMeta?: boolean }>(),
    { showMeta: true },
  )
  defineEmits<{ retry: [] }>()

  const emptySummaries = emptyEditorSummaries()
  const docForRender = computed<EditorDocument | null>(() =>
    hasDoc(props.message.content_json)
      ? (props.message.content_json as unknown as EditorDocument)
      : null,
  )

  function boxStyle(media: { width: number | null; height: number | null }) {
    const w = media.width
    const h = media.height
    if (!w || !h) return { maxWidth: '240px', maxHeight: '288px' }
    const scale = Math.min(240 / w, 288 / h, 1)
    return { width: `${Math.round(w * scale)}px`, height: `${Math.round(h * scale)}px` }
  }
</script>

<template>
  <Inline :justify="message.from_me ? 'end' : 'start'">
    <Stack gap="xs" :align="message.from_me ? 'end' : 'start'" class="max-w-4/5">
      <Stack v-if="message.attachments.length" gap="xs" align="end">
        <HikariImage
          v-for="a in message.attachments"
          :key="a.media.id"
          :src="a.media"
          alt="附件图片"
          preview
          class="rounded-xl"
          image-class="size-full object-cover"
          :style="boxStyle(a.media)"
        />
      </Stack>

      <Text
        v-if="docForRender || message.content.trim()"
        as="div"
        class="rounded-2xl px-3.5 py-2 leading-relaxed wrap-anywhere"
        :class="message.from_me ? 'rounded-br-md bg-accent-soft' : 'rounded-bl-md bg-subtle'"
      >
        <HikariContent
          v-if="docForRender"
          :doc="docForRender"
          :summaries="emptySummaries"
          :emoji-sets="emojiSets"
        />
        <Text v-else as="span" class="whitespace-pre-wrap">{{ message.content }}</Text>
      </Text>

      <Inline v-if="message.failed || message.pending || showMeta" gap="xs" class="px-1 text-muted">
        <Button
          v-if="message.failed"
          variant="link"
          tone="danger"
          size="sm"
          class="text-xs"
          @click="$emit('retry')"
        >
          <template #icon><AlertCircle :size="12" /></template>
          重发
        </Button>
        <Clock v-else-if="message.pending" class="size-3" />
        <template v-else>
          <Time :value="message.sent_at" format="time" class="text-xs tabular-nums" />
          <CheckCheck v-if="message.from_me && message.is_read" class="size-3 text-accent-text" />
          <Check v-else-if="message.from_me" class="size-3" />
        </template>
      </Inline>
    </Stack>
  </Inline>
</template>

<style scoped>
  :deep(.hikari-content p) {
    margin: 0;
  }
  :deep(.hikari-content p + p) {
    margin-top: 0.35em;
  }
</style>
