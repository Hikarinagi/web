import { breakpointsTailwind } from '@vueuse/core'
import { computePosition, flip, offset, shift, type VirtualElement } from '@floating-ui/dom'
import { TextSelection } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'
import { animate } from 'motion-v'
import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { TRANSITION } from '~/lib/motion'
import type { EditorPlugin, ToolbarGroup } from '../../plugins/types'

const BUBBLE_GROUPS: ToolbarGroup[] = ['format-inline', 'insert-link']
const SHOW_DELAY_MS = 100

export function useBubbleMenu(
  editor: () => Editor | null,
  items: () => EditorPlugin[],
  menuRef: Readonly<Ref<HTMLElement | null>>,
) {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')

  const visible = ref(false)

  const bubblePlugins = computed(() =>
    items().filter(p => p.toolbarItem && p.group && BUBBLE_GROUPS.includes(p.group)),
  )

  function shouldShow(): boolean {
    const ed = editor()
    if (!ed || isMobile.value) return false
    if (!ed.isEditable || !ed.isFocused) return false
    const { selection } = ed.state
    if (selection.empty) return false
    if (!(selection instanceof TextSelection)) return false
    return true
  }

  async function updatePosition(instant: boolean) {
    const ed = editor()
    const el = menuRef.value
    if (!el || !ed) return
    const head = ed.state.selection.head
    const coords = ed.view.coordsAtPos(head)
    const virtualEl: VirtualElement = {
      getBoundingClientRect: () =>
        new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top),
    }
    const { x, y } = await computePosition(virtualEl, el, {
      placement: 'top',
      strategy: 'fixed',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    })
    animate(el, { x: Math.round(x), y: Math.round(y) }, instant ? { duration: 0 } : TRANSITION)
  }

  // show 防抖:吞掉 focus → selectionUpdate-collapse 这类瞬态闪现。hide 即时。
  let showTimer: ReturnType<typeof setTimeout> | null = null

  function clearShowTimer() {
    if (showTimer) {
      clearTimeout(showTimer)
      showTimer = null
    }
  }

  function evaluate() {
    if (shouldShow()) {
      if (visible.value) {
        nextTick(() => updatePosition(false))
      } else if (!showTimer) {
        showTimer = setTimeout(() => {
          showTimer = null
          if (!shouldShow()) return
          visible.value = true
          nextTick(() => updatePosition(true))
        }, SHOW_DELAY_MS)
      }
    } else {
      clearShowTimer()
      visible.value = false
    }
  }

  watch(
    editor,
    (ed, _, onCleanup) => {
      if (!ed) return
      const onHide = () => {
        clearShowTimer()
        visible.value = false
      }
      ed.on('selectionUpdate', evaluate)
      ed.on('focus', evaluate)
      ed.on('blur', onHide)
      onCleanup(() => {
        ed.off('selectionUpdate', evaluate)
        ed.off('focus', evaluate)
        ed.off('blur', onHide)
      })
    },
    { immediate: true },
  )

  onBeforeUnmount(clearShowTimer)

  return { visible, bubblePlugins, isMobile }
}
