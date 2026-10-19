import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { buildReport } from '~/features/light-novel-reader/report'
import type { ReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
import { useReaderErrors } from '~/features/light-novel-reader/useReaderErrors'

const mounted: { unmount: () => void }[] = []

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountErrors() {
  const engine = {
    fault: ref<string | null>(null),
    failure: ref<string | null>(null),
    stack: shallowRef<unknown>(null),
  }
  let errors!: ReturnType<typeof useReaderErrors>
  mounted.push(
    mount(
      defineComponent({
        setup() {
          errors = useReaderErrors(engine as unknown as ReaderEngine)
          return () => h('div')
        },
      }),
    ),
  )
  return { engine, errors }
}

describe('渲染问题报告', () => {
  it('写出后台列表读取的章节与页码字段', () => {
    const report = buildReport({
      version: '3.34.0',
      rito: { core: '3.2.1', kit: '3.2.1' },
      position: {
        progress: 0.42,
        sourceLocator: { href: 'Text/Section002.xhtml' },
      } as never,
      chapter: { title: '第二章', href: 'Text/Section002.xhtml' },
      spread: { current: 40, total: 120 },
      viewport: { width: 1440, height: 900, ratio: 2 },
      stage: { width: 896, height: 820 },
      userAgent: 'test',
      settings: { fontSize: 18 },
      errors: [],
    })

    expect(report).toMatchObject({
      client: 'web',
      app_version: '3.34.0',
      chapter: { title: '第二章' },
      current_spread: 40,
      total_spreads: 120,
      progress: 0.42,
      source_locator: { href: 'Text/Section002.xhtml' },
    })
  })

  it('书没打开时页码与位置为空', () => {
    const report = buildReport({
      version: 'dev',
      rito: { core: '3.2.1', kit: '3.2.1' },
      position: null,
      chapter: { title: null, href: null },
      spread: null,
      viewport: { width: 390, height: 844, ratio: 3 },
      stage: { width: 0, height: 0 },
      userAgent: 'test',
      settings: {},
      errors: [],
    })

    expect(report.current_spread).toBeNull()
    expect(report.total_spreads).toBeNull()
    expect(report.source_locator).toBeNull()
  })
})

describe('最近错误', () => {
  it('记录页面错误、未处理的 Promise 与打开失败', async () => {
    const { engine, errors } = mountErrors()

    window.dispatchEvent(new ErrorEvent('error', { error: new TypeError('图片解码失败') }))
    const rejection = Object.assign(new Event('unhandledrejection'), { reason: '分片超时' })
    window.dispatchEvent(rejection)
    engine.failure.value = 'network'
    engine.fault.value = 'TypeError: Failed to fetch'
    await nextTick()

    expect(errors.recent.value.map(error => [error.source, error.message])).toEqual([
      ['window', 'TypeError: 图片解码失败'],
      ['promise', '分片超时'],
      ['engine', 'network TypeError: Failed to fetch'],
    ])
  })

  it('记录排版引擎报出的错误，换书后不再收到旧书的错误', async () => {
    const { engine, errors } = mountErrors()
    const listeners = new Set<(event: { source: string; message: string }) => void>()
    const controller = {
      on: (_: 'error', listener: (event: { source: string; message: string }) => void) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    }
    engine.stack.value = { controller }
    await nextTick()

    listeners.forEach(listener => listener({ source: 'image', message: '解码失败' }))
    engine.stack.value = null
    await nextTick()

    expect(listeners.size).toBe(0)
    expect(errors.recent.value.map(error => [error.source, error.message])).toEqual([
      ['rito', 'image: 解码失败'],
    ])
  })

  it('只保留最近十条', () => {
    const { errors } = mountErrors()

    for (let index = 0; index < 12; index += 1) {
      window.dispatchEvent(new ErrorEvent('error', { error: new Error(`第 ${index} 次`) }))
    }

    expect(errors.recent.value).toHaveLength(10)
    expect(errors.recent.value[0]?.message).toBe('Error: 第 2 次')
  })
})
