<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem } from '@hina-ui/vue'
  import type { Editor } from '@tiptap/vue-3'
  import { ref, shallowRef } from 'vue'
  import type { EditorPluginContext, ToolbarDropdownItem } from '../plugins/types'

  const props = defineProps<{
    editor: Editor | null
    context: EditorPluginContext
  }>()

  const items = shallowRef<ToolbarDropdownItem[]>([])
  const anchor = shallowRef<HTMLElement | null>(null)
  const open = ref(false)

  function isDisabled(item: ToolbarDropdownItem) {
    const editor = props.editor
    return editor === null || (item.isDisabled?.(editor) ?? false)
  }

  function select(item: ToolbarDropdownItem) {
    const editor = props.editor
    if (!editor || !anchor.value) return
    item.onClick(editor, props.context, anchor.value)
  }

  defineExpose({
    open(dropdownItems: ToolbarDropdownItem[], triggerEl: HTMLElement) {
      items.value = dropdownItems
      anchor.value = triggerEl
      open.value = true
    },
  })
</script>

<template>
  <DropdownMenu v-model:open="open" :anchor="anchor" label="插入" align="start">
    <template #content>
      <DropdownMenuItem
        v-for="item in items"
        :key="item.label"
        :disabled="isDisabled(item)"
        @select="select(item)"
      >
        <template #icon><component :is="item.icon" /></template>
        {{ item.label }}
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
