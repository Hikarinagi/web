<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import { computed, useTemplateRef } from 'vue'
  import type { EditorPluginContext, ToolbarDropdownItem } from '../plugins/types'

  const props = defineProps<{
    editor: Editor | null
    context: EditorPluginContext
  }>()

  const items = ref<ToolbarDropdownItem[]>([])
  const trigger = ref<HTMLElement | null>(null)
  const menuRef = useTemplateRef<InstanceType<typeof Menu>>('menuRef')

  const model = computed<MenuItem[]>(() =>
    items.value.map(item => ({
      label: item.label,
      __dropdownItem: item,
      command: () => {
        if (!props.editor || !trigger.value) return
        item.onClick(props.editor, props.context, trigger.value)
      },
    })),
  )

  function open(dropdownItems: ToolbarDropdownItem[], triggerEl: HTMLElement, event: Event) {
    items.value = dropdownItems
    trigger.value = triggerEl
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
</style>
