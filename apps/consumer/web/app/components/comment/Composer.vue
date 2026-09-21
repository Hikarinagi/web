<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="none">
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
        <Inline gap="xs" class="mb-2 text-xs text-muted">
          <CornerDownRight class="size-3.5 shrink-0" />
          <Text as="span" size="xs">
            回复
            <Text as="span" size="xs" tone="accent" weight="medium">@{{ replyToName }}</Text>
          </Text>
        </Inline>
      </motion.div>
    </AnimatePresence>

    <Inline gap="md" align="start">
      <Avatar :user="auth.user" class="size-9! shrink-0" />
      <Stack gap="none" class="min-w-0 flex-1">
        <Button
          login-required
          v-if="!auth.isAuthenticated"
          ref="loginButtonRef"
          variant="outline"
          tone="neutral"
          size="sm"
          block
          class="justify-start rounded-(--editor-chrome-radius) px-3 text-muted"
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
      </Stack>
    </Inline>
  </Stack>
</template>
