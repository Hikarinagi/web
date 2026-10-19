import type { ReaderTurn } from './useReaderAnalytics'
import type { ReaderEngine } from './useReaderEngine'

export function useReaderInput(options: {
  engine: ReaderEngine
  host: Readonly<Ref<HTMLElement | null>>
  tapTurn: () => boolean
  paused: () => boolean
  edge: (forward: boolean) => boolean
  turned: (method: ReaderTurn) => void
  onMiddle: () => void
  keys: Record<string, () => void>
}) {
  const controller = () => options.engine.stack.value?.controller
  let press: { x: number; y: number; at: number } | null = null
  let wheel = {
    total: 0,
    locked: false,
    timer: undefined as ReturnType<typeof setTimeout> | undefined,
    deltas: [] as number[],
  }
  let lastNotch = 0

  function turn(forward: boolean, method: ReaderTurn = 'button') {
    const current = controller()
    if (!current || options.edge(forward)) return
    options.turned(method)
    current.clearSelection()
    if (forward) current.nextSpread()
    else current.prevSpread()
  }

  useEventListener(
    options.host,
    'pointerdown',
    (event: PointerEvent) => {
      press = { x: event.clientX, y: event.clientY, at: event.timeStamp }
    },
    { capture: true, passive: true },
  )

  useEventListener(options.host, 'click', (event: MouseEvent) => {
    const current = controller()
    const host = options.host.value
    const start = press
    press = null
    if (!current || !host || !start || event.detail > 1) return
    if (event.timeStamp - start.at > 300) return
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return
    if (current.hitTestContent({ clientX: event.clientX, clientY: event.clientY })) return
    if (current.hasSelection) {
      current.clearSelection()
      return
    }
    const rect = host.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    if (options.tapTurn() && ratio < 1 / 3) turn(false, 'tap')
    else if (options.tapTurn() && ratio > 2 / 3) turn(true, 'tap')
    else options.onMiddle()
  })

  useEventListener(
    options.host,
    'wheel',
    (event: WheelEvent) => {
      if (!controller() || event.ctrlKey) return
      event.preventDefault()
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
      const notch = event.deltaMode !== 0 || (Number.isInteger(delta) && Math.abs(delta) >= 100)
      if (notch) {
        if (event.timeStamp - lastNotch < 120) return
        lastNotch = event.timeStamp
        turn(delta > 0, 'wheel')
        return
      }
      clearTimeout(wheel.timer)
      wheel.timer = setTimeout(() => {
        wheel = { total: 0, locked: false, timer: undefined, deltas: [] }
      }, 220)
      wheel.deltas = [...wheel.deltas.slice(-19), Math.abs(delta)]
      const newer = wheel.deltas.slice(-10)
      const older = wheel.deltas.slice(0, -10)
      const mean = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length
      if (older.length && mean(newer) <= mean(older)) {
        wheel.locked = false
        wheel.total = 0
        return
      }
      if (wheel.locked) return
      wheel.total += delta
      if (Math.abs(wheel.total) < 30) return
      wheel.locked = true
      turn(wheel.total > 0, 'wheel')
    },
    { passive: false },
  )

  useEventListener(document.body, 'keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const target = event.target as Node
    if (target !== document.body && !options.host.value?.contains(target)) event.stopPropagation()
  })

  watch(
    () => [options.engine.stack.value, options.paused()] as const,
    ([stack, paused], _, onCleanup) => {
      if (!stack) return
      stack.controller.keyboard.setEnabled(!paused)
      const turns = { ArrowRight: true, PageDown: true, ' ': true, ArrowLeft: false, PageUp: false }
      const offs = [
        ...Object.entries(turns).map(([key, forward]) =>
          stack.controller.keyboard.register(key, () => turn(forward, 'key')),
        ),
        ...Object.entries(options.keys).map(([key, action]) =>
          stack.controller.keyboard.register(key, action),
        ),
      ]
      onCleanup(() => offs.forEach(off => off()))
    },
    { immediate: true },
  )

  return { turn }
}
