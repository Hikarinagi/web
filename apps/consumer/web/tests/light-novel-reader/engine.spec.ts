import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { useReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
import type { ReaderSettings } from '~/features/light-novel-reader/useReaderSettings'

const startSession = vi.hoisted(() => vi.fn())

vi.mock('@ritojs/kit', async importOriginal => ({
  ...(await importOriginal<typeof import('@ritojs/kit')>()),
  canDrawWithWebGl2: () => false,
}))

vi.mock('~/features/light-novel-reader/publication', async importOriginal => ({
  ...(await importOriginal<typeof import('~/features/light-novel-reader/publication')>()),
  startSession,
}))

const mounted: { unmount: () => void }[] = []

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  startSession.mockReset()
})

function mountEngine() {
  const settings = {
    device: ref({ spread: 'auto', margin: 24, fontSize: 18, lineHeight: 1.8, effect: 'slide' }),
    palette: ref({ background: '#ffffff', text: '#000000' }),
    font: ref('original'),
  } as unknown as ReaderSettings
  let engine!: ReturnType<typeof useReaderEngine>
  const wrapper = mount(
    defineComponent({
      setup() {
        engine = useReaderEngine({
          volumeId: () => 1,
          position: () => null,
          host: ref(null),
          size: ref({ width: 800, height: 600 }),
          settings,
          highlights: { adapter: {} as never, prepare: async () => {} },
        })
        return () => null
      },
    }),
  )
  mounted.push(wrapper)
  return engine
}

describe('浏览器给不出 WebGL2', () => {
  it('打开前就给出 webgl 失败，不开阅读会话也不下载', async () => {
    const engine = mountEngine()
    await engine.open()
    expect(engine.failure.value).toBe('webgl')
    expect(engine.phase.value).toBe('failed')
    expect(startSession).not.toHaveBeenCalled()
  })
})
