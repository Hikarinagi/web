<script setup lang="ts">
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
  <div class="hikari-undo-redo">
    <Button
      v-tooltip.top="'撤销'"
      unstyled
      type="button"
      aria-label="撤销"
      class="hikari-undo-redo__btn"
      :disabled="!canUndo"
      @mousedown.prevent
      @click="undo"
    >
      <Undo2 :size="15" />
    </Button>
    <Button
      v-tooltip.top="'重做'"
      unstyled
      type="button"
      aria-label="重做"
      class="hikari-undo-redo__btn"
      :disabled="!canRedo"
      @mousedown.prevent
      @click="redo"
    >
      <Redo2 :size="15" />
    </Button>
  </div>
</template>

<style scoped>
  .hikari-undo-redo {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .hikari-undo-redo__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: var(--editor-chip-radius);
    background: transparent;
    color: var(--editor-text-muted);
    cursor: pointer;
    transition:
      background 120ms ease-out,
      color 120ms ease-out,
      opacity 160ms ease-out;
  }
  .hikari-undo-redo__btn:hover:not(:disabled) {
    background: var(--editor-toolbar-item-hover);
    color: var(--editor-text-color);
  }
  .hikari-undo-redo__btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
