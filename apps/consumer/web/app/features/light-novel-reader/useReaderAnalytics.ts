import type { ReaderEnd } from './useReaderEnd'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderShell } from './useReaderShell'
import { IDLE_MS } from './useReaderSync'

export type ReaderTurn = 'tap' | 'wheel' | 'key' | 'button'

export function useReaderAnalytics(options: {
  volumeId: () => number
  engine: ReaderEngine
  shell: ReaderShell
  end: ReaderEnd
}) {
  const { engine, shell, end } = options
  const apm = useApm()
  let turns = { tap: 0, wheel: 0, key: 0, button: 0, drag: 0 }
  let opening = { at: performance.now(), cached: true }
  let held = false
  let dragging = false
  let spent = 0
  let lastInput = performance.now()
  let visible = true

  function track(
    name:
      | 'open'
      | 'close'
      | 'panel'
      | 'search'
      | 'highlight'
      | 'note'
      | 'export'
      | 'focus'
      | 'finish'
      | 'next',
    attributes: Record<string, string | number | boolean | null> = {},
  ) {
    apm.track(`ln_reader_${name}`, { volume_id: options.volumeId(), ...attributes })
  }

  function tick() {
    const now = performance.now()
    if (visible) spent += Math.min(now - lastInput, IDLE_MS)
    lastInput = now
  }

  function leave() {
    tick()
    const total = Object.values(turns).reduce((sum, count) => sum + count, 0)
    if (spent >= 1000 || total > 0)
      track('close', {
        duration_ms: Math.round(spent),
        turns: total,
        ...Object.fromEntries(
          Object.entries(turns).map(([method, count]) => [`turns_${method}`, count]),
        ),
      })
    spent = 0
    turns = { tap: 0, wheel: 0, key: 0, button: 0, drag: 0 }
  }

  function turned(method: ReaderTurn) {
    turns[method] += 1
  }

  watch(
    engine.phase,
    phase => {
      if (phase === 'prepare') opening = { at: performance.now(), cached: true }
      if (phase === 'download') opening.cached = false
      if (phase !== 'ready' && phase !== 'failed') return
      track('open', {
        duration_ms: Math.round(performance.now() - opening.at),
        cached: opening.cached,
        outcome: phase === 'ready' ? 'ok' : 'failed',
        failure: engine.failure.value,
      })
    },
    { flush: 'sync' },
  )

  watch(engine.stack, (stack, _, onCleanup) => {
    if (!stack) return
    const offs = [
      stack.controller.on('transitionStart', () => (dragging = held)),
      stack.controller.on('transitionEnd', ({ outcome }) => {
        if (outcome === 'committed' && dragging) turns.drag += 1
      }),
    ]
    onCleanup(() => offs.forEach(off => off()))
  })

  const navigation = computed(
    () => shell.leftDocked.value || shell.drawer.value === 'left' || shell.sheet.value === 'toc',
  )
  const settings = computed(
    () =>
      shell.rightDocked.value === 'settings' ||
      shell.drawer.value === 'settings' ||
      shell.sheet.value === 'settings',
  )
  const layout = computed(() => [shell.focused.value, shell.medium.value, shell.wide.value].join())
  watch(
    () => [navigation.value ? shell.tab.value : null, settings.value, layout.value] as const,
    ([tab, open, now], [shown, opened, before]) => {
      if (now !== before) return
      if (tab && tab !== shown) track('panel', { panel: 'navigation', tab })
      if (open && !opened) track('panel', { panel: 'settings' })
    },
  )
  watch(shell.focused, on => track('focus', { on }))
  watch(end.open, open => {
    if (open) track('finish')
  })

  useEventListener(
    document,
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') {
        leave()
        visible = false
      } else {
        visible = true
        lastInput = performance.now()
      }
    },
    { capture: true },
  )
  useEventListener(window, 'pagehide', leave, { capture: true })
  useEventListener(
    document,
    'pointerdown',
    () => {
      held = true
      tick()
    },
    { capture: true, passive: true },
  )
  useEventListener(document, ['pointerup', 'pointercancel'], () => (held = false), {
    capture: true,
    passive: true,
  })
  useEventListener(document, 'keydown', tick, { passive: true })
  onBeforeUnmount(leave)

  return { track, turned }
}

export type ReaderAnalytics = ReturnType<typeof useReaderAnalytics>
