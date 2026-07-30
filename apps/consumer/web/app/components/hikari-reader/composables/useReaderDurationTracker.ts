import { onBeforeUnmount, onMounted } from 'vue'

const INACTIVE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes of no input ends the active session
const TICK_INTERVAL_MS = 1000

export function useReaderDurationTracker() {
  let accumulated = 0
  let lastTick: number | null = null
  let lastActivity = 0
  let interval: ReturnType<typeof setInterval> | null = null

  function markActivity() {
    lastActivity = Date.now()
    if (lastTick === null) lastTick = lastActivity
  }

  function isActive(now: number) {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false
    return now - lastActivity < INACTIVE_TIMEOUT_MS
  }

  function tick() {
    const now = Date.now()
    if (lastTick !== null && isActive(now)) {
      accumulated += Math.min(now - lastTick, TICK_INTERVAL_MS * 2)
    }
    lastTick = isActive(now) ? now : null
  }

  function consume() {
    tick()
    const value = accumulated
    accumulated = 0
    return value
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      tick()
      lastTick = null
    } else {
      markActivity()
    }
  }

  onMounted(() => {
    if (!import.meta.client) return
    markActivity()
    interval = setInterval(tick, TICK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointerdown', markActivity, { passive: true })
    window.addEventListener('pointermove', markActivity, { passive: true })
    window.addEventListener('keydown', markActivity)
    window.addEventListener('wheel', markActivity, { passive: true })
    window.addEventListener('touchstart', markActivity, { passive: true })
  })

  onBeforeUnmount(() => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    if (!import.meta.client) return
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pointerdown', markActivity)
    window.removeEventListener('pointermove', markActivity)
    window.removeEventListener('keydown', markActivity)
    window.removeEventListener('wheel', markActivity)
    window.removeEventListener('touchstart', markActivity)
  })

  return { consume, markActivity }
}
