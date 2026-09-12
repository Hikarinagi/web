<script setup lang="ts">
  import { Card, Center, IconButton, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="none" class="relative shrink-0 border-t border-line bg-surface px-4 py-1.5">
    <Center
      class="group absolute inset-x-0 -top-1 z-10 h-2 cursor-ns-resize touch-none"
      @pointerdown="onResizeStart"
    >
      <Stack
        gap="none"
        :class="
          cn(
            'h-0.5 w-8 rounded-full bg-transparent transition-colors group-hover:bg-line-strong',
            dragging && 'bg-line-strong!',
          )
        "
      />
    </Center>

    <Inline gap="none">
      <IconButton label="表情" size="sm" @click="openEmojiPicker">
        <SmilePlus />
      </IconButton>
      <IconButton label="图片" size="sm" :disabled="attachmentsFull" @click="openMediaLibrary">
        <ImagePlus />
      </IconButton>
    </Inline>

    <Stack
      gap="none"
      class="dm-composer-editor cursor-text overflow-y-auto px-1 py-1"
      :style="{ height: `${editorHeight}px` }"
      @click="editor?.commands.focus()"
    >
      <Text v-if="!editor" tone="muted" class="text-[15px]">发消息…</Text>
      <HikariEditor v-else :editor="editor" />
    </Stack>

    <ScrollArea v-if="attachments.length" axis="x" wheel-to-horizontal>
      <Inline gap="sm" :wrap="false" class="px-1 py-1.5">
        <Card
          v-for="m in attachments"
          :key="m.id"
          :padded="false"
          class="relative size-16 shrink-0 shadow-none"
        >
          <HikariImage
            :src="m.src"
            alt=""
            preset="small"
            class="size-full"
            image-class="size-full object-cover"
          >
            <template #empty />
            <template #error />
          </HikariImage>
          <IconButton
            label="移除"
            :tooltip="false"
            variant="solid"
            tone="neutral"
            size="sm"
            class="absolute top-1 right-1 size-5"
            @click.stop="removeAttachment(m.id)"
          >
            <Trash2 :size="12" />
          </IconButton>
        </Card>
      </Inline>
    </ScrollArea>

    <HikariEditorOverlayHost v-if="editor" :plugins="plugins" />
  </Stack>
</template>

<style scoped>
  .dm-composer-editor {
    scrollbar-width: thin;
    scrollbar-color: var(--hn-border-strong) transparent;
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
