<script setup lang="ts">
  import { GripVertical, Plus } from '@lucide/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import { offset } from '@floating-ui/dom'
  import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'
  import { AnimatePresence, motion } from 'motion-v'
  import type { Node as PMNode } from '@tiptap/pm/model'
  import type { Transaction } from '@tiptap/pm/state'
  import type { Editor } from '@tiptap/vue-3'
  import type { EditorMenuGroup } from './menu/Floating.vue'
  import {
    canConvertBlock,
    convertBlock,
    deleteBlock,
    duplicateBlock,
    insertAfterBlock,
  } from './block-handle/commands'
  import {
    blockDecorationKey,
    blockDecorationPlugin,
    type BlockDecoration,
  } from './block-handle/decoration'
  import { BLOCK_ACTION_ITEMS, BLOCK_CONVERT_ITEMS } from './block-handle/menu-items'
  import { gapKey, gapPlugin } from './block-handle/drag/gap'
  import { useBlockDrag } from './block-handle/drag/useBlockDrag'

  defineOptions({ name: 'HikariEditorBlockHandle' })

  const props = defineProps<{ editor: Editor | null }>()

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const roomy = breakpoints.greaterOrEqual('lg')

  const pos = ref<number | null>(null)
  const hovered = ref(false)
  const menuOpen = ref(false)
  const gripRef = useTemplateRef<HTMLElement>('gripRef')

  const { dragging, indicator, onPointerDown } = useBlockDrag(
    () => props.editor,
    () => pos.value,
    openMenu,
    onDropped,
  )

  function onDropped(landed: number) {
    pos.value = landed
    hovered.value = false
  }

  function onNodeChange(data: { node: PMNode | null; pos: number }) {
    if (dragging.value || menuOpen.value) return
    pos.value = data.node ? data.pos : null
    hovered.value = data.node !== null
  }

  let applied: BlockDecoration | null = null

  function decorate() {
    const editor = props.editor
    let next: BlockDecoration | null = null
    if (editor && pos.value !== null && !dragging.value && menuOpen.value) {
      next = { pos: pos.value, cls: 'hikari-block-active' }
    }
    if (!editor) return
    if (applied?.pos === next?.pos && applied?.cls === next?.cls) return
    applied = next
    editor.view.dispatch(editor.state.tr.setMeta(blockDecorationKey, next))
  }

  watch([pos, menuOpen, dragging], decorate)

  function lockHandle(locked: boolean) {
    const editor = props.editor
    if (!editor) return
    editor.view.dispatch(editor.state.tr.setMeta('lockDragHandle', locked))
  }

  function openMenu() {
    if (pos.value === null || !gripRef.value) return
    menuOpen.value = true
    lockHandle(true)
  }

  function closeMenu() {
    if (!menuOpen.value) return
    menuOpen.value = false
    lockHandle(false)
  }

  const menuGroups = computed<EditorMenuGroup[]>(() => {
    const editor = props.editor
    const at = pos.value
    if (!editor || at === null) return []

    const actions: EditorMenuGroup = { items: BLOCK_ACTION_ITEMS }
    if (!canConvertBlock(editor, at)) return [actions]
    return [{ label: '转换为', items: BLOCK_CONVERT_ITEMS }, actions]
  })

  function onSelect(id: string) {
    const editor = props.editor
    const at = pos.value
    closeMenu()
    if (!editor || at === null) return

    if (id === 'duplicate') return void duplicateBlock(editor, at)
    if (id === 'delete') return void deleteBlock(editor, at)
    const conversion = BLOCK_CONVERT_ITEMS.find(item => item.id === id)
    if (conversion) convertBlock(editor, at, conversion.target)
  }

  watch(
    [() => props.editor, roomy],
    ([editor], _prev, onCleanup) => {
      if (!editor || !roomy.value) return
      const surface = editor.view.dom
      surface.classList.add('hikari-has-block-gutter')
      editor.registerPlugin(blockDecorationPlugin())
      editor.registerPlugin(gapPlugin())

      const remap = ({ transaction }: { transaction: Transaction }) => {
        if (!transaction.docChanged) return
        if (pos.value !== null) pos.value = transaction.mapping.map(pos.value)
        if (applied) applied = { ...applied, pos: transaction.mapping.map(applied.pos) }
      }
      editor.on('transaction', remap)

      onCleanup(() => {
        surface.classList.remove('hikari-has-block-gutter')
        editor.off('transaction', remap)
        editor.unregisterPlugin(blockDecorationKey)
        editor.unregisterPlugin(gapKey)
      })
    },
    { immediate: true },
  )

  const handlePosition = { placement: 'left-start' as const, middleware: [offset(16)] }

  const shown = computed(() => (hovered.value || menuOpen.value) && !dragging.value)

  function onInsert() {
    if (props.editor && pos.value !== null) insertAfterBlock(props.editor, pos.value)
  }

  const indicatorStyle = computed(() => {
    const drop = indicator.value
    if (!drop) return undefined
    return {
      left: `${Math.round(drop.left)}px`,
      top: `${Math.round(drop.top)}px`,
      width: `${Math.round(drop.width)}px`,
    }
  })
</script>

<template>
  <div>
    <DragHandle
      v-if="editor && roomy"
      :editor="editor"
      class="hikari-block-handle-root"
      :compute-position-config="handlePosition"
      @node-change="onNodeChange"
    >
      <div class="hikari-block-handle" :data-shown="shown">
        <Button
          v-tooltip.left="'在下方插入'"
          unstyled
          type="button"
          draggable="false"
          class="hikari-block-handle__btn"
          @mousedown.prevent
          @click="onInsert"
        >
          <Plus :size="15" />
        </Button>
        <div
          ref="gripRef"
          v-tooltip.left="'拖动以移动，点击打开菜单'"
          role="button"
          aria-label="拖动以移动，点击打开菜单"
          class="hikari-block-handle__btn hikari-block-handle__grip"
          :data-open="menuOpen"
          @pointerdown="onPointerDown"
        >
          <GripVertical :size="15" />
        </div>
      </div>
    </DragHandle>

    <HikariEditorMenuFloating
      :open="menuOpen"
      :anchor="gripRef"
      :groups="menuGroups"
      @select="onSelect"
      @close="closeMenu"
    />

    <Teleport to="body">
      <AnimatePresence>
        <motion.div
          v-if="indicator"
          class="hikari-block-drop-line"
          :style="indicatorStyle"
          :initial="{ opacity: 0, y: -4 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }"
        />
      </AnimatePresence>
    </Teleport>
  </div>
</template>

<style>
  @media (min-width: 1024px) {
    .ProseMirror.hikari-has-block-gutter {
      padding-left: 80px;
      margin-left: -80px;
    }
  }

  .hikari-block-handle-root {
    visibility: visible !important;
    transition:
      top 140ms cubic-bezier(0.22, 1, 0.36, 1),
      left 140ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .hikari-block-handle {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    opacity: 0;
    transform: translateX(4px);
    pointer-events: none;
    transition:
      opacity 120ms ease-out,
      transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hikari-block-handle[data-shown='true'] {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .hikari-block-handle__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: var(--editor-chip-radius);
    background: transparent;
    color: var(--editor-text-muted);
    transition:
      background 120ms ease-out,
      color 120ms ease-out;
  }
  .hikari-block-handle__btn:hover {
    background: var(--editor-toolbar-item-hover);
    color: var(--editor-text-color);
  }
  .hikari-block-handle__grip {
    cursor: grab;
    touch-action: none;
  }
  .hikari-block-handle__grip:active {
    cursor: grabbing;
  }
  .hikari-block-handle__grip[data-open='true'] {
    background: var(--editor-toolbar-item-active-bg);
    color: var(--editor-toolbar-item-active);
  }

  .hikari-editor-surface .hikari-block-entering {
    overflow: hidden;
    transition:
      height 220ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 180ms ease-out;
  }

  .hikari-editor-surface .hikari-block-active {
    background: var(--editor-selection-bg);
    box-shadow: 0 0 0 6px var(--editor-selection-bg);
    border-radius: var(--editor-chip-radius);
    transition:
      background 140ms ease-out,
      box-shadow 140ms ease-out;
  }

  .hikari-block-drag-preview {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10600;
    pointer-events: none;
  }
  .hikari-block-drag-preview.is-settling {
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hikari-block-drag-preview__lift {
    transform-origin: top left;
    border-radius: var(--editor-panel-radius);
    background: var(--editor-surface-bg);
    box-shadow: 0 0 0 rgb(0 0 0 / 0);
    opacity: 0.85;
    transition:
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 180ms ease-out,
      opacity 180ms ease-out;
  }
  .hikari-block-drag-preview__lift.is-lifted {
    transform: rotate(1.5deg) scale(1.02);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.18);
    opacity: 0.98;
  }
  html.dark .hikari-block-drag-preview__lift.is-lifted {
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);
  }

  .hikari-block-drop-line {
    position: fixed;
    z-index: 10590;
    height: 6px;
    border-radius: var(--editor-chip-radius);
    background: var(--editor-selection-bg);
    pointer-events: none;
    transition:
      top 160ms cubic-bezier(0.22, 1, 0.36, 1),
      left 160ms cubic-bezier(0.22, 1, 0.36, 1),
      width 160ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .hikari-editor-surface .ProseMirror.hikari-blocks-shifting > * {
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hikari-editor-surface .ProseMirror .hikari-block-collapsing {
    overflow: hidden;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    opacity: 0;
    transition:
      height 200ms cubic-bezier(0.22, 1, 0.36, 1),
      margin 200ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 140ms ease-out;
  }
</style>
