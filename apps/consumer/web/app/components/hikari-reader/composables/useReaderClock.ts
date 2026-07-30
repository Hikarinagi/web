import { onBeforeUnmount, onMounted, ref } from 'vue'

function formatClock(date: Date) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function useReaderClock() {
  const time = ref(formatClock(new Date()))
  let timer: number | null = null

  function tick() {
    time.value = formatClock(new Date())
  }

  function scheduleNextTick() {
    if (timer !== null) clearTimeout(timer)
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    timer = window.setTimeout(() => {
      tick()
      scheduleNextTick()
    }, msUntilNextMinute)
  }

  onMounted(() => {
    if (!import.meta.client) return
    tick()
    scheduleNextTick()
  })

  onBeforeUnmount(() => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  })

  return { time }
}
