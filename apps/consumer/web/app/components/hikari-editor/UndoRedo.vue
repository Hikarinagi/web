<script setup lang="ts">
  import { IconButton, Inline } from '@hina-ui/vue'
  import { Redo2, Undo2 } from '@lucide/vue'
  import type { Editor } from '@tiptap/vue-3'

  defineOptions({ name: 'HikariEditorUndoRedo' })

  const props = defineProps<{ editor: Editor | null }>()

  const canUndo = computed(() => props.editor?.can().undo() ?? false)
  const canRedo = computed(() => props.editor?.can().redo() ?? false)

  function undo() {
    props.editor?.chain().focus().undo().run()
  }

  function redo() {
    props.editor?.chain().focus().redo().run()
  }
</script>

<template>
  <Inline align="center" gap="xs" :wrap="false">
    <IconButton
      label="撤销"
      tooltip
      side="top"
      size="sm"
      :disabled="!canUndo"
      @mousedown.prevent
      @click="undo"
    >
      <Undo2 />
    </IconButton>
    <IconButton
      label="重做"
      tooltip
      side="top"
      size="sm"
      :disabled="!canRedo"
      @mousedown.prevent
      @click="redo"
    >
      <Redo2 />
    </IconButton>
  </Inline>
</template>
