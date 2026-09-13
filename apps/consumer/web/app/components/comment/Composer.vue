<script setup lang="ts">
  import { CornerDownRight } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import type { CommentEmojiSets, CommentSummaries } from '~/features/comment/comment'
  import type { MediaValue } from '~/components/media-library/types'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'CommentComposer' })

  withDefaults(
    defineProps<{
      emojiSets?: CommentEmojiSets
      collapsible?: boolean
      replyToName?: string | null
      placeholder?: string
      submitting?: boolean
      rows?: number
      overlayEnabled?: boolean
      initialAttachments?: MediaValue[]
    }>(),
    {
      emojiSets: () => [],
      collapsible: false,
      replyToName: null,
      placeholder: '写下你的评论…',
      submitting: false,
      rows: 3,
      overlayEnabled: true,
      initialAttachments: () => [],
    },
  )

  const emit = defineEmits<{
    submit: [
      json: EditorDocument,
      emojiSets: CommentEmojiSets,
      attachments: MediaValue[],
      summaries: CommentSummaries,
    ]
    cancel: []
  }>()

  const auth = useAuthStore()
  const loginButtonRef = ref<{ $el?: HTMLElement }>()
  const editorRef = ref<{ focus: () => void; reset: () => void }>()

  function focus() {
    if (editorRef.value) {
      editorRef.value.focus()
      return
    }
    loginButtonRef.value?.$el?.focus()
  }

  defineExpose({ focus, reset: () => editorRef.value?.reset() })
</script>

<template>
  <div>
    <AnimatePresence>
      <motion.div
        v-if="replyToName"
        key="ctx"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <div class="mb-2 flex items-center gap-1.5 text-xs text-muted-color">
          <CornerDownRight class="size-3.5 shrink-0" />
          <span>
            回复
            <span class="font-medium text-hikari-primary-600">@{{ replyToName }}</span>
          </span>
        </div>
      </motion.div>
    </AnimatePresence>

    <div class="flex items-start gap-3">
      <Avatar :user="auth.user" shape="circle" class="size-9! shrink-0" />
      <div class="min-w-0 flex-1">
        <Button
          v-if="!auth.isAuthenticated"
          ref="loginButtonRef"
          login-required
          unstyled
          class="flex h-9 w-full items-center rounded-(--editor-chrome-radius) border border-surface-200 px-3 text-sm text-muted-color transition-colors hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600"
        >
          {{ placeholder }}
        </Button>
        <CommentEditor
          v-else
          ref="editorRef"
          :collapsible="collapsible"
          :reply-to-name="replyToName"
          :placeholder="placeholder"
          :submitting="submitting"
          :rows="rows"
          :overlay-enabled="overlayEnabled"
          :autofocus="replyToName !== null"
          :document-emoji-sets="emojiSets"
          :initial-attachments="initialAttachments"
          :show-cancel="collapsible"
          @submit="(json, sets, atts, summaries) => emit('submit', json, sets, atts, summaries)"
          @cancel="emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>
