interface UseReaderChromeOptions {
  panelOpen: () => boolean
}

const EDGE_LEAVE_HIDE_MS = 420
const TOP_EDGE_PX = 72
const BOTTOM_EDGE_PX = 96

/**
 * Chrome starts visible and only a deliberate tap puts it away — matching the
 * mobile reader, which has no auto-hide timer at all. Pointer devices keep the
 * edge-reveal affordance on top of that, since a mouse has no tap.
 */
export function useReaderChrome(options: UseReaderChromeOptions) {
  const visible = ref(true)
  let reason: 'manual' | 'edge' = 'manual'
  let hideTimer: number | null = null

  function clearTimer() {
    if (hideTimer === null) return
    window.clearTimeout(hideTimer)
    hideTimer = null
  }

  function show() {
    clearTimer()
    reason = 'manual'
    visible.value = true
  }

  function hide() {
    if (options.panelOpen()) return
    clearTimer()
    visible.value = false
  }

  function toggle() {
    if (visible.value) hide()
    else show()
  }

  function onStagePointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    const inEdge =
      event.clientY <= TOP_EDGE_PX || event.clientY >= window.innerHeight - BOTTOM_EDGE_PX
    if (inEdge) {
      if (!visible.value) reason = 'edge'
      visible.value = true
      clearTimer()
      return
    }
    if (visible.value && reason === 'edge' && hideTimer === null && !options.panelOpen()) {
      hideTimer = window.setTimeout(() => {
        hideTimer = null
        if (!options.panelOpen()) visible.value = false
      }, EDGE_LEAVE_HIDE_MS)
    }
  }

  onBeforeUnmount(clearTimer)

  return { visible, show, hide, toggle, onStagePointerMove }
}
