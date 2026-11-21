import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import type { ReaderSettings } from '~/features/light-novel-reader/useReaderSettings'
import type { ReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
import type { ReaderLocation } from '~/features/light-novel-reader/useReaderLocation'
import type { ReaderShell } from '~/features/light-novel-reader/useReaderShell'
import { layoutWhere, marginOf } from '~/features/light-novel-reader/engine'
import { widestPage } from '~/features/light-novel-reader/settings'
import { useReaderEnd } from '~/features/light-novel-reader/useReaderEnd'
import { useReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
import { useReaderInput } from '~/features/light-novel-reader/useReaderInput'
import { useReaderLocation } from '~/features/light-novel-reader/useReaderLocation'
import { useReaderSelection } from '~/features/light-novel-reader/useReaderSelection'

const created = vi.hoisted(() => ({
  views: [] as unknown[],
  stacks: [] as unknown[],
  options: [] as { margin: unknown }[],
}))
const order = vi.hoisted(() => [] as string[])

vi.mock('@ritojs/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@ritojs/core')>()),
  preloadReaderRuntime: async () => {},
}))

vi.mock('@ritojs/kit', async importOriginal => ({
  ...(await importOriginal<typeof import('@ritojs/kit')>()),
  canDrawWithWebGl2: () => true,
  createScrollController: () => created.views.shift(),
}))

vi.mock('~/features/light-novel-reader/publication', () => ({
  startSession: async () => ({ publication: { skeleton: { bytes: 0 } } }),
  cachedSkeleton: async () => true,
  openPublication: async () => ({}),
}))

vi.mock('~/features/light-novel-reader/fonts', () => ({
  fontCatalogue: async () => [{ id: 'original', sha256: 'a', bytes: 0 }],
  cachedFont: async () => true,
  loadFont: async () => new ArrayBuffer(0),
  fontFace: () => ({}),
}))

vi.mock('~/features/light-novel-reader/engine', async importOriginal => ({
  ...(await importOriginal<typeof import('~/features/light-novel-reader/engine')>()),
  createStack: async (options: { margin: unknown }) => {
    created.options.push(options)
    return created.stacks.shift()
  },
}))

const mounted: VueWrapper[] = []

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  vi.useRealTimers()
  order.length = 0
  created.options.length = 0
})

function fakeView(overrides: Record<string, unknown> = {}) {
  const handlers = new Map<string, ((event: never) => void)[]>()
  const view = {
    canvas: document.createElement('canvas'),
    axis: 'down' as 'down' | 'left',
    offset: 0,
    currentSpread: 0,
    selection: null as unknown,
    selectionRects: () => [{ x: 1, y: 2, width: 3, height: 4 }],
    scrollToLocator: async (locator: { href: string }) => {
      order.push(`scrollToLocator:${locator.href}`)
      return true
    },
    mount: () => order.push('mount'),
    dispose: () => order.push('dispose'),
    clearSelection: () => {},
    on(name: string, handler: (event: never) => void) {
      handlers.set(name, [...(handlers.get(name) ?? []), handler])
      return () =>
        handlers.set(
          name,
          handlers.get(name)!.filter(item => item !== handler),
        )
    },
    emit(name: string, event: unknown) {
      handlers.get(name)?.forEach(handler => handler(event as never))
    },
    ...overrides,
  }
  return view
}

function mountWith<T>(setup: () => T) {
  let result!: T
  const wrapper = mount(
    defineComponent({
      setup() {
        result = setup()
        return () => h('div')
      },
    }),
    { attachTo: document.body },
  )
  mounted.push(wrapper)
  return { result, element: wrapper.element as HTMLElement }
}

function fakeStack(scrolled: { value: boolean }) {
  const commits: (() => void)[] = []
  const layouts: { mode: string; margin: unknown }[] = []
  const resized: unknown[][] = []
  const reader = {
    getScrollLayout: () => (scrolled.value ? {} : undefined),
    updateLayout(_width: number, _height: number, mode: string, margin: unknown) {
      order.push(`updateLayout:${mode}`)
      layouts.push({ mode, margin })
      scrolled.value = mode === 'scrolled'
      commits.forEach(commit => commit())
      return false
    },
    navigateToLocator: async (locator: { href: string }) => {
      order.push(`navigateToLocator:${locator.href}`)
    },
    onLayoutCommitted(commit: () => void) {
      commits.push(commit)
      return () => commits.splice(commits.indexOf(commit), 1)
    },
    dispose: async () => {},
    spreads: [],
  }
  const controller = {
    position: { sourceLocator: { href: 'ch1.xhtml' } },
    suspend: () => order.push('suspend'),
    resume: () => order.push('resume'),
    mount: () => order.push('pages.mount'),
    dispose: () => {},
    setSpreadMode: () => {},
    resize: (...size: unknown[]) => resized.push(size),
    setTypography: () => order.push('setTypography'),
    spreads: [],
  }
  return { reader, controller, canvas: document.createElement('canvas'), layouts, resized }
}

describe('翻页与滚动切换', () => {
  function mountEngine(flow: 'paged' | 'scrolled', width = 800) {
    const size = ref({ width, height: 600 })
    const device = ref({
      flow,
      spread: 'auto',
      margin: 24,
      pageWidth: 900,
      fontSize: 18,
      lineHeight: 1.8,
      effect: 'slide',
    })
    const settings = {
      device,
      palette: ref({ background: '#fff', text: '#000' }),
      font: ref('original'),
    } as unknown as ReaderSettings
    const { result: engine } = mountWith(() =>
      useReaderEngine({
        volumeId: () => 1,
        position: () => ({ sourceLocator: { href: 'saved.xhtml' } }),
        host: ref(document.createElement('div')),
        size,
        settings,
        highlights: { adapter: {} as never, prepare: async () => {} },
      }),
    )
    return { engine, device, size }
  }

  it('以滚动方式打开时先挂起翻页控制器，再定位到上次位置', async () => {
    const stack = fakeStack({ value: true })
    const view = fakeView()
    created.stacks.push(stack)
    created.views.push(view)
    const { engine } = mountEngine('scrolled')

    await engine.open()

    expect(order).toEqual(['suspend', 'pages.mount', 'scrollToLocator:saved.xhtml', 'mount'])
    expect(engine.view.value).toBe(view)
    expect(engine.phase.value).toBe('ready')
  })

  it('切到滚动时从翻页位置接续，切回时回到滚动读到的位置', async () => {
    const scrolled = { value: false }
    const stack = fakeStack(scrolled)
    const view = fakeView()
    created.stacks.push(stack)
    created.views.push(view)
    const { engine, device } = mountEngine('paged')
    await engine.open()
    expect(engine.view.value).toBeNull()
    order.length = 0

    device.value = { ...device.value, flow: 'scrolled' }
    await vi.waitFor(() => expect(engine.view.value).toBe(view))
    expect(order).toEqual([
      'suspend',
      'updateLayout:scrolled',
      'scrollToLocator:ch1.xhtml',
      'mount',
    ])
    expect(engine.switching.value).toBe(false)

    view.emit('position', { locator: { href: 'ch9.xhtml' } })
    order.length = 0
    device.value = { ...device.value, flow: 'paged' }
    await vi.waitFor(() => expect(order).toContain('resume'))

    expect(order).toEqual([
      'dispose',
      'navigateToLocator:ch9.xhtml',
      'updateLayout:single',
      'resume',
    ])
    expect(engine.view.value).toBeNull()
  })

  it('宽屏上以滚动方式打开时，一开始就按页宽上限排版', async () => {
    created.stacks.push(fakeStack({ value: true }))
    created.views.push(fakeView())
    const { engine } = mountEngine('scrolled', 3440)

    await engine.open()

    expect(created.options[0]?.margin).toEqual({ x: 1294, y: 24 })
  })

  it('切换阅读方式时，页边距和排版模式一起提交', async () => {
    const stack = fakeStack({ value: false })
    const view = fakeView()
    created.stacks.push(stack)
    created.views.push(view)
    const { engine, device } = mountEngine('paged', 3440)
    await engine.open()

    device.value = { ...device.value, flow: 'scrolled' }
    await vi.waitFor(() => expect(engine.view.value).toBe(view))
    device.value = { ...device.value, flow: 'paged' }
    await vi.waitFor(() => expect(order).toContain('resume'))

    expect(stack.layouts).toEqual([
      { mode: 'scrolled', margin: { x: 1294, y: 24 } },
      { mode: 'double', margin: 24 },
    ])
  })

  it('滚动时改页面宽度或窗口宽度，都按新的宽度重排', async () => {
    const stack = fakeStack({ value: true })
    created.stacks.push(stack)
    created.views.push(fakeView())
    const { engine, device, size } = mountEngine('scrolled', 3440)
    await engine.open()

    device.value = { ...device.value, pageWidth: 1000 }
    await nextTick()
    size.value = { width: 1200, height: 600 }
    await nextTick()

    expect(stack.resized).toEqual([
      [3440, 600, { x: 1244, y: 24 }],
      [1200, 600, { x: 124, y: 24 }],
    ])
  })

  it('改字号不改变用户设的页面宽度', async () => {
    const stack = fakeStack({ value: true })
    created.stacks.push(stack)
    created.views.push(fakeView())
    const { engine, device } = mountEngine('scrolled', 3440)
    await engine.open()
    order.length = 0

    device.value = { ...device.value, fontSize: 20 }
    await nextTick()

    expect(stack.resized).toEqual([])
    expect(order).toEqual(['setTypography'])
  })

  it('排版迟迟不提交时进入失败态而不是一直转圈', async () => {
    const scrolled = { value: false }
    const stack = fakeStack(scrolled)
    stack.reader.updateLayout = () => false
    created.stacks.push(stack)
    created.views.push(fakeView())
    const { engine, device } = mountEngine('paged')
    await engine.open()

    vi.useFakeTimers()
    device.value = { ...device.value, flow: 'scrolled' }
    await nextTick()
    await vi.advanceTimersByTimeAsync(15_000)
    vi.useRealTimers()
    await vi.waitFor(() => expect(engine.phase.value).toBe('failed'))

    expect(engine.failure.value).toBe('engine')
    expect(engine.switching.value).toBe(false)
  })

  it('等待排版提交时忽略不符合目标模式的提交', async () => {
    let scrolled = false
    let commit = () => {}
    const reader = {
      getScrollLayout: () => (scrolled ? {} : undefined),
      onLayoutCommitted(listener: () => void) {
        commit = listener
        return () => {}
      },
    }
    let settled = false
    const waiting = layoutWhere(reader as never, true).then(() => (settled = true))

    commit()
    await Promise.resolve()
    expect(settled).toBe(false)

    scrolled = true
    commit()
    await waiting
    expect(settled).toBe(true)
  })
})

describe('滚动模式的页面宽度', () => {
  it('翻页模式仍然使用用户设的页边距', () => {
    expect(marginOf('paged', 3440, 60, 900)).toBe(60)
  })

  it('窗口比页面窄时，左右边距就是用户设的值', () => {
    expect(marginOf('scrolled', 800, 60, 900)).toEqual({ x: 60, y: 60 })
  })

  it('超出页面宽度的部分平分到左右两侧', () => {
    expect(marginOf('scrolled', 3440, 60, 900)).toEqual({ x: 1330, y: 60 })
  })

  it('页面宽度不小于窗口时排满', () => {
    expect(marginOf('scrolled', 1920, 60, 1920)).toEqual({ x: 60, y: 60 })
  })

  it('页面宽度固定时，调页边距仍然改变文字宽度', () => {
    const textWidth = (margin: number) => {
      const resolved = marginOf('scrolled', 3440, margin, 900) as { x: number }
      return 3440 - resolved.x * 2
    }
    expect(textWidth(0)).toBe(900)
    expect(textWidth(120)).toBe(660)
  })

  it('滑块最右端总能覆盖整个窗口', () => {
    expect(widestPage(1920)).toBe(1920)
    expect(widestPage(1375)).toBe(1380)
    expect(widestPage(400)).toBe(480)
  })
})

describe('滚动模式的输入', () => {
  function mountInput(view: ReturnType<typeof fakeView>, atEnd = false) {
    const edge = vi.fn((_forward: boolean) => false)
    const app = vi.fn()
    let paused = false
    const engine = {
      stack: shallowRef({
        controller: { keyboard: { setEnabled: () => {}, register: () => () => {} } },
      }),
      view: shallowRef(view),
    } as unknown as ReaderEngine
    const { element } = mountWith(() =>
      useReaderInput({
        engine,
        host: ref(document.body),
        tapTurn: () => false,
        paused: () => paused,
        edge,
        atEnd: () => atEnd,
        turned: () => {},
        onMiddle: () => {},
        keys: { t: app },
      }),
    )
    const reaching = vi.fn()
    window.addEventListener('keydown', reaching)
    const stop = () => window.removeEventListener('keydown', reaching)
    return {
      edge,
      app,
      element,
      reaching,
      stop,
      pause: () => (paused = true),
    }
  }

  const wheelAt = (timeStamp: number, deltaY: number) => {
    const event = new WheelEvent('wheel', { deltaY, cancelable: true, bubbles: true })
    Object.defineProperty(event, 'timeStamp', { value: timeStamp })
    document.body.dispatchEvent(event)
    return event
  }

  it('已停在卷末时新的一次滚轮进入读完页，且不抢占滚动条本身', () => {
    const { edge } = mountInput(fakeView(), true)
    const event = wheelAt(1000, 40)
    expect(edge).toHaveBeenCalledWith(true)
    expect(event.defaultPrevented).toBe(false)
  })

  it('滑动中才到达卷末时，后续的惯性不触发读完页', () => {
    let atEnd = false
    const view = fakeView()
    const edge = vi.fn(() => false)
    const engine = {
      stack: shallowRef({
        controller: { keyboard: { setEnabled: () => {}, register: () => () => {} } },
      }),
      view: shallowRef(view),
    } as unknown as ReaderEngine
    mountWith(() =>
      useReaderInput({
        engine,
        host: ref(document.body),
        tapTurn: () => false,
        paused: () => false,
        edge,
        atEnd: () => atEnd,
        turned: () => {},
        onMiddle: () => {},
        keys: {},
      }),
    )

    wheelAt(1000, 40)
    atEnd = true
    wheelAt(1016, 40)
    wheelAt(1032, 40)
    expect(edge).not.toHaveBeenCalled()

    wheelAt(1600, 40)
    expect(edge).toHaveBeenCalledTimes(1)
  })

  it('输入框里的方向键不会传到滚动视图', () => {
    const { reaching, stop } = mountInput(fakeView())
    const field = document.createElement('input')
    document.body.append(field)

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    stop()
    field.remove()

    expect(reaching).not.toHaveBeenCalled()
  })

  it('浮层打开时翻动键不会传到滚动视图，但其他按键不受影响', () => {
    const { reaching, stop, pause } = mountInput(fakeView())
    pause()

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }))
    expect(reaching).not.toHaveBeenCalled()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    stop()

    expect(reaching).toHaveBeenCalledTimes(1)
  })

  it('未到卷末时翻动键交给滚动视图处理', () => {
    const { edge, reaching, stop } = mountInput(fakeView())
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }))
    stop()
    expect(edge).toHaveBeenCalledWith(true)
    expect(reaching).toHaveBeenCalledTimes(1)
  })

  it('向左滚动的书用左方向键前进', () => {
    const { edge, stop } = mountInput(fakeView({ axis: 'left' }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    stop()
    expect(edge.mock.calls).toEqual([[true]])
  })

  it('应用快捷键在翻页控制器挂起时仍然可用', async () => {
    const { app } = mountInput(fakeView())
    await nextTick()
    document.documentElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true }),
    )
    expect(app).toHaveBeenCalledTimes(1)
  })
})

describe('滚动模式的位置', () => {
  function mountLocation(view: ReturnType<typeof fakeView>) {
    const reader = {
      layoutScope: 'book',
      toc: [],
      pageCount: 3,
      findPage: () => null,
      manifestHrefMap: new Map(),
      onLayoutCommitted: () => () => {},
      spreads: [
        { pageIndexes: [0], leftPageIndex: 0 },
        { pageIndexes: [1], leftPageIndex: 1 },
      ],
    }
    const stack = shallowRef({ reader, controller: { on: () => () => {}, totalSpreads: 0 } })
    const engine = {
      stack,
      view: shallowRef(view),
      spreads: () => reader.spreads,
    } as unknown as ReaderEngine
    return mountWith(() => useReaderLocation(engine)).result
  }

  it('静止时的位置来自滚动视图，页码取自当前窗口', async () => {
    const view = fakeView({ currentSpread: 1 })
    const location = mountLocation(view)
    await nextTick()

    view.emit('scroll', { offset: 900, extent: 1800, viewport: 900, progress: 0.5 })
    view.emit('position', { locator: { href: 'ch2.xhtml' } })
    await nextTick()

    expect(location.laid.value).toBe(true)
    expect(location.position.value).toMatchObject({
      sourceLocator: { href: 'ch2.xhtml' },
      projection: { spreadIndex: 1, pageIndex: 1 },
      progress: 0.5,
    })
    expect(location.book.value).toEqual({ from: 2, to: 2, total: 3 })
  })
})

describe('滚动模式的读完页', () => {
  function mountEnd(view: ReturnType<typeof fakeView>) {
    const engine = {
      stack: shallowRef({ controller: { on: () => () => {} } }),
      view: shallowRef(view),
    } as unknown as ReaderEngine
    const location = {
      laid: ref(true),
      position: shallowRef(null),
    } as unknown as ReaderLocation
    const shell = { chrome: ref(true) } as unknown as ReaderShell
    const host = ref(document.createElement('div'))
    return mountWith(() =>
      useReaderEnd({
        volumeId: () => 1,
        host,
        engine,
        location,
        shell,
        flush: () => undefined,
      }),
    ).result
  }

  beforeEach(() => {
    vi.stubGlobal(
      'hikariRequest',
      vi.fn(async () => null),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('滚到底才算读到卷末，离开后读完页自动收起', async () => {
    const view = fakeView()
    const end = mountEnd(view)
    await nextTick()
    expect(end.last()).toBe(false)

    view.emit('scroll', { progress: 1 })
    expect(end.last()).toBe(true)
    expect(end.edge(true)).toBe(true)
    expect(end.open.value).toBe(true)

    view.emit('scroll', { progress: 0.4 })
    expect(end.open.value).toBe(false)
    expect(end.last()).toBe(false)
  })
})

describe('滚动模式的选区工具条', () => {
  function mountSelection(view: ReturnType<typeof fakeView>) {
    const engine = {
      stack: shallowRef({
        controller: { on: () => () => {}, renderScale: 1 },
        canvas: view.canvas,
      }),
      view: shallowRef(view),
    } as unknown as ReaderEngine
    return mountWith(() => useReaderSelection(engine, ref(document.createElement('div')))).result
  }

  const range = { sourceLocator: { href: 'ch1.xhtml' } }
  const rects = [{ x: 10, y: 20, width: 30, height: 40 }]

  it('拖动选择过程中不出现，松手后出现', async () => {
    const view = fakeView()
    const selection = mountSelection(view)
    await nextTick()

    view.emit('selection', { range, text: '字', selecting: true, rects })
    await nextTick()
    expect(selection.anchor.value).toBeNull()

    view.emit('selection', { range, text: '字', selecting: false, rects })
    await nextTick()
    expect(selection.anchor.value).not.toBeNull()
    expect(selection.text.value).toBe('字')
  })

  it('选区绘制引起的重绘不会把工具条清掉', async () => {
    const view = fakeView()
    const selection = mountSelection(view)
    await nextTick()

    view.emit('selection', { range, text: '字', selecting: false, rects })
    view.emit('scroll', { offset: 0 })
    await nextTick()

    expect(selection.anchor.value).not.toBeNull()
  })

  it('滚动时隐藏，停下后回到选区的新位置', async () => {
    const view = fakeView()
    const selection = mountSelection(view)
    await nextTick()
    view.emit('selection', { range, text: '字', selecting: false, rects })

    view.emit('scroll', { offset: 200 })
    await nextTick()
    expect(selection.anchor.value).toBeNull()

    view.selection = range
    view.emit('rest', { offset: 200 })
    await nextTick()
    expect(selection.anchor.value).not.toBeNull()
  })

  it('跨章选区不能高亮', async () => {
    const view = fakeView()
    const selection = mountSelection(view)
    await nextTick()

    view.emit('selection', { range: {}, text: '字', selecting: false, rects })

    expect(selection.chapter.value).toBe(false)
  })
})
