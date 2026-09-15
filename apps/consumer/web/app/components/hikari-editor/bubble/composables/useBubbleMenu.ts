import { breakpointsTailwind } from '@vueuse/core'
import { TextSelection } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'
import type { OverlayAnchor } from '@hina-ui/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useEditorOverlays } from '../../composables/useEditorOverlays'
import type { EditorPlugin, ToolbarGroup } from '../../plugins/types'

const BUBBLE_GROUPS: ToolbarGroup[] = ['format-inline', 'insert-link']
const SHOW_DELAY_MS = 100

export function useBubbleMenu(editor: () => Editor | null, items: () => EditorPlugin[]) {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')

  const visible = ref(false)
  const { active } = useEditorOverlays()

  const bubblePlugins = computed(() =>
    items().filter(p => p.toolbarItem && p.group && BUBBLE_GROUPS.includes(p.group)),
  )

  const holding = ref(false)

  let frozen: DOMRect | null = null

  const anchor = computed<OverlayAnchor | null>(() => {
    const ed = editor()
    if (!ed) return null
    return {
      contextElement: ed.view.dom,
      getBoundingClientRect: () => {
        if (!visible.value && frozen) return frozen
        const { from, to } = ed.state.selection
        const start = ed.view.coordsAtPos(from)
        const end = ed.view.coordsAtPos(to)
        const left = Math.min(start.left, end.left)
        const right = Math.max(start.right, end.right)
        const top = Math.min(start.top, end.top)
        const bottom = Math.max(start.bottom, end.bottom)
        frozen = new DOMRect(left, top, right - left, bottom - top)
        return frozen
      },
    }
  })

  function shouldShow(): boolean {
    const ed = editor()
    if (!ed || isMobile.value) return false
    if (!ed.isEditable) return false
    if (holding.value) return true
    if (!ed.isFocused) return false
    const { selection } = ed.state
    if (selection.empty) return false
    if (!(selection instanceof TextSelection)) return false
    return true
  }

  // show 防抖：吞掉 focus → selectionUpdate-collapse 这类瞬态闪现。hide 即时。
  let showTimer: ReturnType<typeof setTimeout> | null = null

  function clearShowTimer() {
    if (showTimer) {
      clearTimeout(showTimer)
      showTimer = null
    }
  }

  function evaluate() {
    if (shouldShow()) {
      if (visible.value) return
      if (showTimer) return
      showTimer = setTimeout(() => {
        showTimer = null
        if (shouldShow()) visible.value = true
      }, SHOW_DELAY_MS)
    } else {
      clearShowTimer()
      visible.value = false
    }
  }

  function press(plugin: EditorPlugin, run: () => void) {
    run()
    holding.value = !!active.value
  }

  watch(active, current => {
    if (!current) holding.value = false
  })

  watch(holding, held => {
    if (!held) evaluate()
  })

  watch(
    editor,
    (ed, _, onCleanup) => {
      if (!ed) return
      const onHide = () => {
        if (holding.value) return
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

  return { visible, anchor, bubblePlugins, press }
}
