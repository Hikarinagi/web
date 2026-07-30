<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import Button from './toolbar/Button.vue'
  import Dropdown from './toolbar/Dropdown.vue'
  import type { EditorPlugin, EditorPluginContext, ToolbarGroup } from './plugins/types'

  const props = defineProps<{
    editor: Editor | null
    items: EditorPlugin[]
    context: EditorPluginContext
  }>()

  const GROUP_KEYS: ToolbarGroup[] = ['format-inline', 'format-block', 'insert-media']

  const grouped = computed(() => {
    const map: Record<ToolbarGroup, EditorPlugin[]> = {
      'format-inline': [],
      'format-block': [],
      'insert-link': [],
      'insert-media': [],
    }
    for (const p of props.items) {
      if (!p.toolbarItem || p.group === null) continue
      map[p.group].push(p)
    }
    return map
  })

  const renderedGroups = computed(() =>
    GROUP_KEYS.map(key => ({ key, plugins: grouped.value[key] })).filter(g => g.plugins.length > 0),
  )

  const dropdownRef = useTemplateRef<InstanceType<typeof Dropdown>>('dropdownRef')

  function handleClick(plugin: EditorPlugin, event: MouseEvent) {
    if (!props.editor || !plugin.toolbarItem) return
    const trigger = event.currentTarget as HTMLElement
    if (plugin.toolbarItem.variant === 'dropdown') {
      dropdownRef.value?.open(plugin.toolbarItem.dropdownItems ?? [], trigger, event)
      return
    }
    plugin.toolbarItem.onClick?.(props.editor, props.context, trigger)
  }

  function isActive(plugin: EditorPlugin): boolean {
    if (!props.editor || !plugin.toolbarItem?.isActive) return false
    return plugin.toolbarItem.isActive(props.editor)
  }

  function isDisabled(plugin: EditorPlugin): boolean {
    if (!props.editor || !plugin.toolbarItem?.isDisabled) return false
    return plugin.toolbarItem.isDisabled(props.editor)
  }
</script>

<template>
  <div class="editor-toolbar">
    <ScrollArea visibility="hidden" axis="x" shadow="both" class="editor-toolbar__scroll">
      <div class="editor-toolbar__row">
        <template v-for="(group, idx) in renderedGroups" :key="group.key">
          <div class="toolbar-group">
            <Button
              v-for="plugin in group.plugins"
              :key="plugin.id"
              :icon="plugin.toolbarItem!.icon"
              :tooltip="plugin.toolbarItem!.tooltip"
              :active="isActive(plugin)"
              :disabled="isDisabled(plugin) || !editor"
              :is-dropdown="plugin.toolbarItem!.variant === 'dropdown'"
              @press="handleClick(plugin, $event)"
            />
          </div>
          <div v-if="idx < renderedGroups.length - 1" class="toolbar-divider" />
        </template>
      </div>
    </ScrollArea>
    <Dropdown ref="dropdownRef" :editor="editor" :context="context" />
  </div>
</template>

<style scoped>
  .editor-toolbar {
    padding: 8px 12px;
    background: var(--editor-toolbar-bg);
    border-bottom: 1px solid var(--editor-toolbar-border);
  }
  .editor-toolbar__scroll {
    width: 100%;
  }
  .editor-toolbar__row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: max-content;
  }
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .toolbar-divider {
    width: 1px;
    height: 20px;
    background: var(--editor-toolbar-divider);
  }
</style>
