<script setup lang="ts">
  import { Button, Inline, Popover } from '@hina-ui/vue'
  import type { Editor } from '@tiptap/vue-3'
  import { useBubbleMenu } from './bubble/composables/useBubbleMenu'
  import type { EditorPlugin, EditorPluginContext } from './plugins/types'

  defineOptions({ name: 'HikariEditorBubbleMenu' })

  const props = defineProps<{
    editor: Editor | null
    items: EditorPlugin[]
    context: EditorPluginContext
  }>()

  const { visible, anchor, bubblePlugins, press } = useBubbleMenu(
    () => props.editor,
    () => props.items,
  )

  function isActive(plugin: EditorPlugin): boolean {
    if (!props.editor || !plugin.toolbarItem?.isActive) return false
    return plugin.toolbarItem.isActive(props.editor)
  }

  function onPress(plugin: EditorPlugin, event: MouseEvent) {
    const editor = props.editor
    if (!editor || !plugin.toolbarItem) return
    const trigger = event.currentTarget as HTMLElement
    press(plugin, () => plugin.toolbarItem?.onClick?.(editor, props.context, trigger))
  }
</script>

<template>
  <Popover
    v-model:open="visible"
    :anchor="anchor"
    :modal="false"
    side="top"
    update-position-strategy="always"
    :padded="false"
    class="max-w-none p-1"
    @open-auto-focus="event => event.preventDefault()"
    @interact-outside="event => event.preventDefault()"
    @escape-key-down="event => event.preventDefault()"
  >
    <template #content>
      <Inline align="center" gap="xs" :wrap="false">
        <Button
          v-for="plugin in bubblePlugins"
          :key="plugin.id"
          :aria-label="plugin.toolbarItem!.tooltip"
          :variant="isActive(plugin) ? 'soft' : 'ghost'"
          :tone="isActive(plugin) ? 'accent' : 'neutral'"
          size="sm"
          icon-only
          @mousedown.prevent
          @click="(event: MouseEvent) => onPress(plugin, event)"
        >
          <template #icon><component :is="plugin.toolbarItem!.icon" /></template>
        </Button>
      </Inline>
    </template>
  </Popover>
</template>
