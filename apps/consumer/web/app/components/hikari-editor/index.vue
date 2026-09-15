<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import { EditorContent } from '@tiptap/vue-3'

  defineOptions({ name: 'HikariEditor' })
  defineProps<{ editor: Editor | null }>()
</script>

<template>
  <EditorContent v-if="editor" :editor="editor" class="hikari-content hikari-editor-surface" />
</template>
