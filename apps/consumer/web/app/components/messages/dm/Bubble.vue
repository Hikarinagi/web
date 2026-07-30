<script setup lang="ts">
  import { AlertCircle, Check, CheckCheck, Clock } from '@lucide/vue'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
  import type { DmEmojiSet, ThreadMessage } from '~/features/messages/dm'
  import { hasDoc, messageClock } from '~/features/messages/dm'

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
  <div class="flex" :class="message.from_me ? 'justify-end' : 'justify-start'">
    <div
      class="flex max-w-[78%] flex-col gap-1"
      :class="message.from_me ? 'items-end' : 'items-start'"
    >
      <div v-if="message.attachments.length" class="flex flex-col items-end gap-1">
        <div
          v-for="a in message.attachments"
          :key="a.media.id"
          class="overflow-hidden rounded-xl"
          :style="boxStyle(a.media)"
        >
          <HikariImage
            :src="a.media.src"
            alt="附件图片"
            preview
            class="size-full"
            image-class="size-full object-cover"
          />
        </div>
      </div>

      <div
        v-if="docForRender || message.content.trim()"
        class="rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed wrap-anywhere"
        :class="
          message.from_me
            ? 'rounded-br-md bg-primary/10 text-color dark:bg-primary/20'
            : 'rounded-bl-md bg-surface-100 text-color dark:bg-surface-800'
        "
      >
        <HikariContent
          v-if="docForRender"
          :doc="docForRender"
          :summaries="emptySummaries"
          :emoji-sets="emojiSets"
        />
        <span v-else class="whitespace-pre-wrap">{{ message.content }}</span>
      </div>

      <div
        v-if="message.failed || message.pending || showMeta"
        class="flex items-center gap-1 px-1 text-[10px] text-muted-color"
      >
        <Button
          v-if="message.failed"
          unstyled
          class="inline-flex items-center gap-0.5 text-red-500"
          @click="$emit('retry')"
        >
          <AlertCircle class="size-3" />
          重发
        </Button>
        <Clock v-else-if="message.pending" class="size-3" />
        <template v-else>
          <span class="tabular-nums">{{ messageClock(message.sent_at) }}</span>
          <CheckCheck v-if="message.from_me && message.is_read" class="size-3 text-primary" />
          <Check v-else-if="message.from_me" class="size-3" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  :deep(.hikari-content p) {
    margin: 0;
  }
  :deep(.hikari-content p + p) {
    margin-top: 0.35em;
  }
</style>
