<script setup lang="ts">
  import { Input, Stack, Text } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { Editor } from '@tiptap/vue-3'
  import { TRANSITION } from '~/lib/motion'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'FeedComposerBody' })

  defineProps<{
    editor: Editor | null
    expanded: boolean
    titleOverLimit: boolean
    fullscreen?: boolean
  }>()
  const title = defineModel<string>('title', { required: true })
</script>

<template>
  <Stack gap="none" class="min-w-0 flex-1">
    <AnimatePresence :initial="false">
      <motion.div
        v-if="expanded"
        key="title"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <Input
          v-model="title"
          variant="bare"
          maxlength="200"
          placeholder="标题"
          :class="
            cn(
              'h-auto pb-1.5 text-base font-semibold [--hn-input-px:0px]',
              titleOverLimit && 'text-danger-text',
            )
          "
        />
      </motion.div>
    </AnimatePresence>

    <Stack
      gap="none"
      :class="
        cn(
          'composer-input',
          !fullscreen && (expanded ? 'max-h-[50dvh] overflow-y-auto' : 'max-h-8.5 overflow-hidden'),
        )
      "
      :style="{ '--composer-min-h': fullscreen ? '40vh' : expanded ? '66px' : '24px' }"
    >
      <Text
        v-if="!editor"
        size="inherit"
        class="text-(--editor-placeholder-color)"
        :style="{ minHeight: 'var(--composer-min-h)' }"
      >
        分享你的发现、推荐…
      </Text>
      <HikariEditor v-else :editor="editor" />
    </Stack>
  </Stack>
</template>

<style scoped>
  .composer-input {
    padding-top: 6px;
    font-size: var(--composer-text-size);
    line-height: var(--composer-leading);
  }
  .composer-input :deep(.hikari-editor-surface) {
    font-size: var(--composer-text-size);
    line-height: var(--composer-leading);
  }
  .composer-input :deep(.ProseMirror) {
    min-height: var(--composer-min-h);
    transition: min-height 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .composer-input :deep(.ProseMirror p) {
    margin: 0;
  }
  .composer-input :deep(.ProseMirror p + p) {
    margin-top: 0.7em;
  }
</style>
