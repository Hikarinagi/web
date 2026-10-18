import type { ReadingPosition } from '@ritojs/kit'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { useReaderSync } from '~/features/light-novel-reader/useReaderSync'

const position = (progress: number) =>
  ({
    progress,
    timestamp: 0,
    projection: { spreadIndex: 0, pageIndex: 0 },
  }) as unknown as ReadingPosition

async function mountSync() {
  const sent: { volume: number; duration?: number }[] = []
  vi.stubGlobal(
    'hikariRequest',
    vi.fn(
      async (
        _path: string,
        init: { path: { volume_id: number }; body: { duration_ms?: number } },
      ) => {
        sent.push({ volume: init.path.volume_id, duration: init.body.duration_ms })
      },
    ),
  )
  const current = shallowRef<ReadingPosition | null>(null)
  let sync!: ReturnType<typeof useReaderSync>
  const wrapper = mount(
    defineComponent({
      setup() {
        sync = useReaderSync({ volumeId: () => 7, position: current, chapter: () => ({}) })
        return () => h('div')
      },
    }),
  )
  const hide = async () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await nextTick()
  }
  return { sent, current, sync: () => sync, wrapper, hide }
}

describe('阅读时长上报', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 18, 9))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  })

  it('翻页后随位置一起上报两次操作之间的时间', async () => {
    const { sent, current, wrapper } = await mountSync()
    vi.advanceTimersByTime(30_000)
    current.value = position(0.1)
    await nextTick()
    vi.advanceTimersByTime(600)
    expect(sent).toEqual([{ volume: 7, duration: 30_600 }])
    wrapper.unmount()
  })

  it('停在同一页切走时，也把这一页的时间报上去', async () => {
    const { sent, current, wrapper, hide } = await mountSync()
    current.value = position(0.1)
    await nextTick()
    vi.advanceTimersByTime(600)
    vi.advanceTimersByTime(120_000)
    await hide()
    expect(sent.map(item => item.duration)).toEqual([600, 120_000])
    wrapper.unmount()
  })

  it('不足一秒的零头不单独发请求，留到下一次', async () => {
    const { sent, current, sync, wrapper } = await mountSync()
    current.value = position(0.1)
    await nextTick()
    vi.advanceTimersByTime(600)
    vi.advanceTimersByTime(400)
    void sync().flush()
    expect(sent).toHaveLength(1)
    wrapper.unmount()
  })
})
