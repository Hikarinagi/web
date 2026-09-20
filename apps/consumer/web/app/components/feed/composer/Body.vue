<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { Editor } from '@tiptap/vue-3'
  import { TRANSITION } from '~/lib/motion'

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
  <div class="min-w-0 flex-1">
    <AnimatePresence>
      <motion.div
        v-if="expanded"
        key="title"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <InputText
          v-model="title"
          unstyled
          maxlength="200"
          placeholder="加个标题（选填）"
          class="w-full border-0 bg-transparent pb-1.5 text-base font-semibold text-color outline-none placeholder:font-normal placeholder:text-(--editor-placeholder-color)"
          :class="titleOverLimit ? 'text-red-500' : ''"
        />
      </motion.div>
    </AnimatePresence>

    <div
      class="composer-input"
      :class="
        fullscreen
          ? ''
          : expanded
            ? 'max-h-[50dvh] overflow-y-auto'
            : 'max-h-[34px] overflow-hidden'
      "
      :style="{ '--composer-min-h': fullscreen ? '40vh' : expanded ? '66px' : '24px' }"
    >
      <p
        v-if="!editor"
        class="text-[15px] leading-[1.65] text-(--editor-placeholder-color)"
        :style="{ minHeight: 'var(--composer-min-h)' }"
      >
        分享你的发现、推荐、打卡…
      </p>
      <HikariEditor v-else :editor="editor" />
    </div>
  </div>
</template>

<style scoped>
  .composer-input {
    padding-top: 6px;
  }
  .composer-input :deep(.hikari-editor-surface) {
    font-size: 15px;
    line-height: 1.65;
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
