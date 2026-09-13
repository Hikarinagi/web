<script setup lang="ts">
  import { ImagePlus, SmilePlus, Trash2 } from '@lucide/vue'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import type { EmojiSetDisplay } from '~/components/hikari-content/composables/useContentEmojiSets'
  import type { MediaValue } from '~/components/media-library/types'
  import { useDmComposer } from './composables/useDmComposer'

  defineOptions({ name: 'MessagesDmComposer' })
  const props = defineProps<{ sending: boolean }>()
  const emit = defineEmits<{
    send: [contentJson: EditorDocument, attachments: MediaValue[], emojiSets: EmojiSetDisplay[]]
  }>()

  const {
    editor,
    plugins,
    openEmojiPicker,
    attachments,
    attachmentsFull,
    openMediaLibrary,
    removeAttachment,
  } = useDmComposer({
    isSubmitting: () => props.sending,
    onSubmit: (json, atts, sets) => emit('send', json, atts, sets),
  })

  const toolBtn =
    'flex size-8 items-center justify-center rounded-md text-muted-color transition-colors hover:bg-surface-100 hover:text-color disabled:opacity-40 dark:hover:bg-surface-800'

  const editorHeight = ref(100)
  const dragging = ref(false)
  let startY = 0
  let startHeight = 0

  function onResizeStart(event: PointerEvent) {
    dragging.value = true
    startY = event.clientY
    startHeight = editorHeight.value
    event.preventDefault()
  }
  useEventListener(window, 'pointermove', (event: PointerEvent) => {
    if (!dragging.value) return
    const cap = window.innerHeight * 0.6
    editorHeight.value = Math.min(cap, Math.max(44, startHeight + (startY - event.clientY)))
  })
  useEventListener(window, 'pointerup', () => {
    dragging.value = false
  })
</script>

<template>
  <div
    class="relative shrink-0 border-t border-surface-200 bg-surface-0 px-4 py-1.5 dark:border-surface-800 dark:bg-surface-900"
  >
    <div
      class="group absolute inset-x-0 -top-1 z-10 flex h-2 cursor-ns-resize touch-none items-center justify-center"
      @pointerdown="onResizeStart"
    >
      <div
        class="h-0.5 w-8 rounded-full bg-transparent transition-colors group-hover:bg-surface-300 dark:group-hover:bg-surface-600"
        :class="dragging ? 'bg-surface-400! dark:bg-surface-500!' : ''"
      />
    </div>

    <div class="flex items-center gap-0.5">
      <Button unstyled aria-label="表情" :class="toolBtn" @click="openEmojiPicker">
        <SmilePlus class="size-[18px]" />
      </Button>
      <Button
        unstyled
        aria-label="图片"
        :class="toolBtn"
        :disabled="attachmentsFull"
        @click="openMediaLibrary"
      >
        <ImagePlus class="size-[18px]" />
      </Button>
    </div>

    <div
      class="dm-composer-editor cursor-text overflow-y-auto px-1 py-1"
      :style="{ height: `${editorHeight}px` }"
      @click="editor?.commands.focus()"
    >
      <p v-if="!editor" class="text-[15px] text-muted-color">发消息…</p>
      <HikariEditor v-else :editor="editor" />
    </div>

    <ScrollArea v-if="attachments.length" axis="x" wheel-to-horizontal>
      <div class="flex gap-2 px-1 py-1.5">
        <div
          v-for="m in attachments"
          :key="m.id"
          class="relative size-16 shrink-0 overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700"
        >
          <HikariImage
            :src="m.src"
            alt=""
            preset="small"
            class="size-full"
            image-class="size-full object-cover"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
          <Button
            unstyled
            aria-label="移除"
            class="absolute top-1 right-1 flex size-5 items-center justify-center rounded-md bg-surface-900/60 text-white"
            @click.stop="removeAttachment(m.id)"
          >
            <template #icon><Trash2 :size="12" /></template>
          </Button>
        </div>
      </div>
    </ScrollArea>

    <HikariEditorOverlayHost v-if="editor" :plugins="plugins" />
  </div>
</template>

<style scoped>
  .dm-composer-editor {
    scrollbar-width: thin;
    scrollbar-color: var(--p-surface-300) transparent;
  }
  :global(.dark) .dm-composer-editor {
    scrollbar-color: var(--p-surface-600) transparent;
  }
  .dm-composer-editor :deep(.hikari-editor-surface) {
    font-size: 15px;
    line-height: 1.5;
  }
  .dm-composer-editor :deep(.ProseMirror p) {
    margin: 0;
  }
  .dm-composer-editor :deep(.ProseMirror p + p) {
    margin-top: 0.4em;
  }
  .dm-composer-editor :deep(.ProseMirror:focus) {
    outline: none;
  }
</style>
