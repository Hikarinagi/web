import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useReaderShell } from '~/features/light-novel-reader/useReaderShell'

function stubWidth(width: number) {
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width:\s*([\d.]+)/.exec(query)
    const max = /max-width:\s*([\d.]+)/.exec(query)
    const matches = (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }
  })
}

const mounted: { unmount: () => void }[] = []

function mountShell() {
  let shell!: ReturnType<typeof useReaderShell>
  mounted.push(
    mount(
      defineComponent({
        setup() {
          shell = useReaderShell()
          return () => h('div')
        },
      }),
    ),
  )
  return shell
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'hikari:light-novel-reader:shell',
    JSON.stringify({ left: true, right: 'settings', leftWidth: 272, rightWidth: 320 }),
  )
})

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  vi.unstubAllGlobals()
})

describe('专注模式', () => {
  it('收起两栏，退出后恢复原来停靠的栏', () => {
    stubWidth(1500)
    const shell = mountShell()
    expect(shell.leftDocked.value).toBe(true)
    expect(shell.rightDocked.value).toBe('settings')

    shell.toggleFocus()

    expect(shell.focused.value).toBe(true)
    expect(shell.leftDocked.value).toBe(false)
    expect(shell.rightDocked.value).toBeNull()

    shell.toggleFocus()

    expect(shell.leftDocked.value).toBe(true)
    expect(shell.rightDocked.value).toBe('settings')
  })

  it('专注时目录与阅读设置从抽屉打开，不改动记住的停靠状态', () => {
    stubWidth(1500)
    const shell = mountShell()
    shell.toggleFocus()

    shell.toggleLeft()
    expect(shell.drawer.value).toBe('left')

    shell.togglePanel('settings')
    expect(shell.drawer.value).toBe('settings')
    expect(shell.stored.value.left).toBe(true)
    expect(shell.stored.value.right).toBe('settings')
  })

  it('按设备记住', async () => {
    stubWidth(1500)
    mountShell().toggleFocus()
    await nextTick()
    mounted.splice(0).forEach(wrapper => wrapper.unmount())

    expect(mountShell().focused.value).toBe(true)
  })

  it('手机上不进入专注模式', () => {
    stubWidth(400)
    const shell = mountShell()

    shell.toggleFocus()

    expect(shell.focused.value).toBe(false)
  })
})

describe('全屏', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'fullScreen')
    Reflect.deleteProperty(document, 'exitFullscreen')
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen')
  })

  it('记住全屏时，第一次按键被浏览器拒绝，之后的按键仍然恢复全屏', async () => {
    stubWidth(1500)
    localStorage.setItem(
      'hikari:light-novel-reader:shell',
      JSON.stringify({
        left: true,
        right: null,
        leftWidth: 272,
        rightWidth: 320,
        fullscreen: true,
      }),
    )
    const request = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Permissions check failed'))
      .mockResolvedValue(undefined)
    Object.defineProperty(document, 'fullScreen', { configurable: true, value: false })
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: vi.fn() })
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: request,
    })
    const shell = mountShell()
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(shell.fullscreen.isFullscreen.value).toBe(false)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await flushPromises()
    expect(shell.fullscreen.isFullscreen.value).toBe(true)

    window.dispatchEvent(new Event('pointerup'))
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
  })
})
