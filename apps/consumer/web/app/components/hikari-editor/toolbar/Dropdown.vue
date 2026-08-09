<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import { ref, useTemplateRef } from 'vue'
  import type { EditorPluginContext, ToolbarDropdownItem } from '../plugins/types'

  const props = defineProps<{
    editor: Editor | null
    context: EditorPluginContext
  }>()

  const model = ref<MenuItem[]>([])
  const menuRef = useTemplateRef<InstanceType<typeof Menu>>('menuRef')

  function open(dropdownItems: ToolbarDropdownItem[], triggerEl: HTMLElement, event: Event) {
    const editor = props.editor
    model.value = dropdownItems.map(item => ({
      label: item.label,
      disabled: editor === null || (item.isDisabled?.(editor) ?? false),
      __dropdownItem: item,
      command: () => {
        if (!editor) return
        item.onClick(editor, props.context, triggerEl)
      },
    }))
    nextTick(() => menuRef.value?.toggle(event))
  }

  defineExpose({ open })
</script>

<template>
  <Menu ref="menuRef" :model="model" popup>
    <template #item="{ item }">
      <a class="dropdown-item">
        <component
          :is="(item as { __dropdownItem: ToolbarDropdownItem }).__dropdownItem.icon"
          :size="16"
        />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>

<style scoped>
  .dropdown-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    color: var(--editor-text-color);
    cursor: pointer;
  }
  li[data-p-disabled='true'] .dropdown-item {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
