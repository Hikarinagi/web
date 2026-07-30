interface UseReaderChromeOptions {
  panelOpen: () => boolean
}

const AUTO_HIDE_MS = 3200
const INTRO_HIDE_MS = 2000
const EDGE_LEAVE_HIDE_MS = 420
const TOP_EDGE_PX = 72
const BOTTOM_EDGE_PX = 96

export function useReaderChrome(options: UseReaderChromeOptions) {
  const visible = ref(false)
  let reason: 'manual' | 'edge' = 'manual'
  let hideTimer: number | null = null

  function clearTimer() {
    if (hideTimer === null) return
    window.clearTimeout(hideTimer)
    hideTimer = null
  }

  function scheduleHide(delay: number) {
    clearTimer()
    hideTimer = window.setTimeout(() => {
      hideTimer = null
      if (!options.panelOpen()) visible.value = false
    }, delay)
  }

  function showTransient(delay = AUTO_HIDE_MS) {
    reason = 'manual'
    visible.value = true
    scheduleHide(delay)
  }

  function showIntro() {
    showTransient(INTRO_HIDE_MS)
  }

  function hide() {
    if (options.panelOpen()) return
    clearTimer()
    visible.value = false
  }

  function toggle() {
    if (visible.value) hide()
    else showTransient()
  }

  function pauseTimer() {
    clearTimer()
  }

  function resumeTimer() {
    if (!visible.value || options.panelOpen()) return
    scheduleHide(AUTO_HIDE_MS)
  }

  function onStagePointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    const inEdge =
      event.clientY <= TOP_EDGE_PX || event.clientY >= window.innerHeight - BOTTOM_EDGE_PX
    if (inEdge) {
      reason = 'edge'
      visible.value = true
      clearTimer()
      return
    }
    if (visible.value && reason === 'edge' && hideTimer === null && !options.panelOpen()) {
      scheduleHide(EDGE_LEAVE_HIDE_MS)
    }
  }

  watch(
    () => options.panelOpen(),
    open => {
      if (open) clearTimer()
      else if (visible.value) scheduleHide(AUTO_HIDE_MS)
    },
  )

  onBeforeUnmount(clearTimer)

  return {
    visible,
    showTransient,
    showIntro,
    hide,
    toggle,
    pauseTimer,
    resumeTimer,
    onStagePointerMove,
  }
}
