<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import { EditorContent } from '@tiptap/vue-3'

  defineOptions({ name: 'HikariEditor' })
  defineProps<{ editor: Editor | null }>()
</script>

<template>
  <EditorContent v-if="editor" :editor="editor" class="hikari-content hikari-editor-surface" />
</template>

<style scoped>
  :deep(.ProseMirror) {
    outline: none;
  }
  :deep(.ProseMirror),
  :deep(.ProseMirror *) {
    overflow-anchor: none;
  }
  :deep(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: var(--editor-placeholder-color);
    float: left;
    height: 0;
    pointer-events: none;
  }
</style>
