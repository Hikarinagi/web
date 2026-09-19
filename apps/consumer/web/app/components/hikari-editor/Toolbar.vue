<script setup lang="ts">
  import { Divider, Inline, ScrollArea } from '@hina-ui/vue'
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
      dropdownRef.value?.open(plugin.toolbarItem.dropdownItems ?? [], trigger)
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
  <Inline gap="none" :wrap="false" class="max-w-full min-w-0 px-3 py-2">
    <ScrollArea :scrollbar="false" direction="horizontal" class="min-w-0 flex-1">
      <Inline align="center" gap="md" :wrap="false" class="w-max">
        <template v-for="(group, idx) in renderedGroups" :key="group.key">
          <Inline align="center" gap="xs" :wrap="false">
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
          </Inline>
          <Divider
            v-if="idx < renderedGroups.length - 1"
            orientation="vertical"
            class="h-5 self-center"
          />
        </template>
      </Inline>
    </ScrollArea>
    <Dropdown ref="dropdownRef" :editor="editor" :context="context" />
  </Inline>
</template>
