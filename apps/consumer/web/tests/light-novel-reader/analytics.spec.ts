import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { useReaderAnalytics } from '~/features/light-novel-reader/useReaderAnalytics'
import type { ReaderEnd } from '~/features/light-novel-reader/useReaderEnd'
import type { ReaderEngine, ReaderPhase } from '~/features/light-novel-reader/useReaderEngine'
import type { ReaderShell } from '~/features/light-novel-reader/useReaderShell'

const mounted: { unmount: () => void }[] = []

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
})

function mountAnalytics() {
  const sent: { name: string; attributes: Record<string, unknown> }[] = []
  vi.stubGlobal('useApm', () => ({
    track: (name: string, attributes: Record<string, unknown>) => sent.push({ name, attributes }),
  }))
  let now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  const listeners = new Map<string, Set<(event: Record<string, unknown>) => void>>()
  const controller = {
    on: (name: string, listener: (event: Record<string, unknown>) => void) => {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name)!.add(listener)
      return () => listeners.get(name)!.delete(listener)
    },
  }
  const emit = (name: string, event: Record<string, unknown> = {}) =>
    listeners.get(name)?.forEach(listener => listener(event))
  const engine = {
    phase: ref<ReaderPhase>('prepare'),
    failure: ref<string | null>(null),
    stack: shallowRef<unknown>(null),
  }
  const stored = ref({ left: false })
  const focused = ref(false)
  const shell = {
    drawer: ref<string | null>(null),
    sheet: ref<string | null>(null),
    tab: ref('toc'),
    focused,
    medium: ref(true),
    wide: ref(true),
    rightDocked: ref<string | null>(null),
    leftDocked: computed(() => stored.value.left && !focused.value),
  }
  const end = { open: ref(false) }
  let analytics!: ReturnType<typeof useReaderAnalytics>
  mounted.push(
    mount(
      defineComponent({
        setup() {
          analytics = useReaderAnalytics({
            volumeId: () => 7,
            engine: engine as unknown as ReaderEngine,
            shell: shell as unknown as ReaderShell,
            end: end as unknown as ReaderEnd,
          })
          return () => h('div')
        },
      }),
    ),
  )
  const hide = () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  }
  return {
    sent,
    engine,
    controller,
    shell,
    stored,
    end,
    analytics,
    emit,
    hide,
    at: (ms: number) => (now = ms),
    named: (name: string) =>
      sent.filter(event => event.name === name).map(event => event.attributes),
  }
}

describe('打开', () => {
  it('记下从开始打开到可读的耗时，没有下载时算命中本机缓存', () => {
    const { engine, at, named } = mountAnalytics()
    at(1200)
    engine.phase.value = 'layout'
    at(1500)
    engine.phase.value = 'ready'

    expect(named('ln_reader_open')).toEqual([
      { volume_id: 7, duration_ms: 1500, cached: true, outcome: 'ok', failure: null },
    ])
  })

  it('重新打开时从头计时；需要下载时不算命中缓存，失败时带上原因', () => {
    const { engine, at, named } = mountAnalytics()
    engine.phase.value = 'ready'
    at(10_000)
    engine.phase.value = 'prepare'
    at(10_200)
    engine.phase.value = 'download'
    at(13_000)
    engine.failure.value = 'network'
    engine.phase.value = 'failed'

    expect(named('ln_reader_open')[1]).toEqual({
      volume_id: 7,
      duration_ms: 3000,
      cached: false,
      outcome: 'failed',
      failure: 'network',
    })
  })
})

describe('离开阅读器', () => {
  it('切到后台时汇报这一段的阅读时长与各方式的翻页数，按住拖动翻过去的才算拖动，跳转不算', async () => {
    const { engine, controller, analytics, emit, hide, at, named } = mountAnalytics()
    engine.stack.value = { controller }
    await nextTick()
    analytics.turned('tap')
    emit('transitionStart')
    emit('transitionEnd', { outcome: 'committed' })
    at(5000)
    document.dispatchEvent(new Event('pointerdown'))
    emit('transitionStart')
    document.dispatchEvent(new Event('pointerup'))
    emit('transitionEnd', { outcome: 'committed' })
    at(6000)
    document.dispatchEvent(new Event('pointerdown'))
    emit('transitionStart')
    document.dispatchEvent(new Event('pointerup'))
    emit('transitionEnd', { outcome: 'cancelled' })
    analytics.turned('key')
    emit('transitionStart')
    emit('transitionEnd', { outcome: 'committed' })
    at(7000)
    emit('transitionStart')
    emit('transitionEnd', { outcome: 'committed' })
    at(9000)
    hide()

    expect(named('ln_reader_close')).toEqual([
      {
        volume_id: 7,
        duration_ms: 9000,
        turns: 3,
        turns_tap: 1,
        turns_wheel: 0,
        turns_key: 1,
        turns_button: 0,
        turns_drag: 1,
      },
    ])
  })

  it('长时间没有操作时最多只算五分钟', () => {
    const { at, hide, named } = mountAnalytics()
    at(1000)
    document.dispatchEvent(new Event('pointerdown'))
    at(1000 + 20 * 60 * 1000)
    hide()

    expect(named('ln_reader_close')[0]?.duration_ms).toBe(1000 + 5 * 60 * 1000)
  })

  it('没读也没翻页时不汇报', () => {
    const { at, hide, named } = mountAnalytics()
    at(500)
    hide()

    expect(named('ln_reader_close')).toEqual([])
  })
})

describe('面板、专注与读完', () => {
  it('打开导航与切换页签、打开阅读设置、开关专注模式、到达结束页各记一次，退出专注模式恢复的停靠栏不算打开', async () => {
    const { shell, stored, end, named } = mountAnalytics()
    stored.value = { left: true }
    await nextTick()
    shell.tab.value = 'highlights'
    await nextTick()
    shell.drawer.value = 'settings'
    await nextTick()
    shell.focused.value = true
    await nextTick()
    shell.focused.value = false
    await nextTick()
    end.open.value = true
    await nextTick()

    expect(named('ln_reader_panel')).toEqual([
      { volume_id: 7, panel: 'navigation', tab: 'toc' },
      { volume_id: 7, panel: 'navigation', tab: 'highlights' },
      { volume_id: 7, panel: 'settings' },
    ])
    expect(named('ln_reader_focus')).toEqual([
      { volume_id: 7, on: true },
      { volume_id: 7, on: false },
    ])
    expect(named('ln_reader_finish')).toEqual([{ volume_id: 7 }])
  })
})
