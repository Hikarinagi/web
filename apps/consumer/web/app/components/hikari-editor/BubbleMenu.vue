<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION_FAST } from '~/lib/motion'
  import Button from './bubble/Button.vue'
  import { useBubbleMenu } from './bubble/composables/useBubbleMenu'
  import type { EditorPlugin, EditorPluginContext } from './plugins/types'

  defineOptions({ name: 'HikariEditorBubbleMenu' })

  const props = defineProps<{
    editor: Editor | null
    items: EditorPlugin[]
    context: EditorPluginContext
  }>()

  const menuRef = useTemplateRef<HTMLElement>('menuRef')
  const { visible, bubblePlugins } = useBubbleMenu(
    () => props.editor,
    () => props.items,
    menuRef,
  )

  function isActive(plugin: EditorPlugin): boolean {
    if (!props.editor || !plugin.toolbarItem?.isActive) return false
    return plugin.toolbarItem.isActive(props.editor)
  }

  function handleClick(plugin: EditorPlugin, event: MouseEvent) {
    if (!props.editor || !plugin.toolbarItem) return
    const trigger = event.currentTarget as HTMLElement
    plugin.toolbarItem.onClick?.(props.editor, props.context, trigger)
  }
</script>

<template>
  <Teleport to="body">
    <div ref="menuRef" class="hikari-bubble-menu-host">
      <AnimatePresence>
        <motion.div
          v-if="visible && bubblePlugins.length > 0"
          class="hikari-bubble-menu"
          :initial="{ opacity: 0, y: 4, scale: 0.96 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 4, scale: 0.96 }"
          :transition="TRANSITION_FAST"
        >
          <Button
            v-for="plugin in bubblePlugins"
            :key="plugin.id"
            :icon="plugin.toolbarItem!.icon"
            :active="isActive(plugin)"
            @press="handleClick(plugin, $event)"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>

<style>
  .hikari-bubble-menu-host {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10500;
    pointer-events: none;
  }
  .hikari-bubble-menu {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    background: var(--p-surface-0);
    border: 1px solid var(--p-surface-200);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    pointer-events: auto;
    transform-origin: bottom center;
  }
  html.dark .hikari-bubble-menu {
    background: var(--p-surface-900);
    border-color: var(--p-surface-700);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
</style>
