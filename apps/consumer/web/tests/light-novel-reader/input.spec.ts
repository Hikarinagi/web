import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { ReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
import { useReaderInput } from '~/features/light-novel-reader/useReaderInput'

const FRAME = 8
const mounted: VueWrapper[] = []

afterEach(() => mounted.splice(0).forEach(wrapper => wrapper.unmount()))

async function mountReader(edge: (forward: boolean) => boolean = () => false) {
  const turns: string[] = []
  const methods: string[] = []
  const cleared: number[] = []
  const middles: number[] = []
  const bindings = new Map<string, () => void>()
  const controller = {
    hasSelection: false,
    clearSelection: () => {
      controller.hasSelection = false
      cleared.push(1)
    },
    hitTestContent: () => null,
    nextSpread: () => turns.push('next'),
    prevSpread: () => turns.push('prev'),
    keyboard: {
      setEnabled: () => {},
      register: (key: string, action: () => void) => {
        bindings.set(key, action)
        return () => bindings.delete(key)
      },
    },
  }
  const engine = { stack: shallowRef({ controller }) } as unknown as ReaderEngine
  const host = ref<HTMLElement | null>(null)
  let input!: ReturnType<typeof useReaderInput>
  const wrapper = mount(
    defineComponent({
      setup() {
        input = useReaderInput({
          engine,
          host,
          tapTurn: () => true,
          paused: () => false,
          edge,
          turned: method => methods.push(method),
          onMiddle: () => middles.push(1),
          keys: {},
        })
        return () => h('div', { ref: host })
      },
    }),
    { attachTo: document.body },
  )
  mounted.push(wrapper)
  await nextTick()
  const element = wrapper.element as HTMLElement
  element.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 300, bottom: 400, width: 300, height: 400, x: 0, y: 0 }) as DOMRect
  let now = 1000
  const wait = (ms: number) => {
    now += ms
    vi.advanceTimersByTime(ms)
  }
  const wheel = (deltaY: number) => {
    const event = new WheelEvent('wheel', { deltaY, cancelable: true, bubbles: true })
    Object.defineProperty(event, 'timeStamp', { value: now })
    element.dispatchEvent(event)
    wait(FRAME)
  }
  const swipe = (from: number, peak: number, until: number, decay = 0.96) => {
    for (const delta of [from, peak * 0.3, peak * 0.6, peak * 0.85, peak]) wheel(delta + 0.25)
    for (let delta = peak; delta > until; delta *= decay) wheel(delta + 0.25)
  }
  const click = (detail: number, clientX = 150) => {
    const down = new PointerEvent('pointerdown', { bubbles: true, clientX, clientY: 200 })
    Object.defineProperty(down, 'timeStamp', { value: now })
    element.dispatchEvent(down)
    wait(90)
    const up = new MouseEvent('click', { bubbles: true, detail, clientX, clientY: 200 })
    Object.defineProperty(up, 'timeStamp', { value: now })
    element.dispatchEvent(up)
  }
  return {
    element,
    turns,
    methods,
    cleared,
    middles,
    bindings,
    controller,
    input,
    wheel,
    swipe,
    wait,
    click,
  }
}

describe('点击', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('双击选词时，第二下点击不清掉刚选中的词', async () => {
    const { cleared, middles, controller, click } = await mountReader()
    click(1)
    controller.hasSelection = true
    click(2)
    expect(cleared).toEqual([])
    expect(controller.hasSelection).toBe(true)
    expect(middles).toEqual([1])
  })

  it('有选区时单击一下只清掉选区', async () => {
    const { turns, cleared, middles, controller, click } = await mountReader()
    controller.hasSelection = true
    click(1)
    expect(cleared).toEqual([1])
    expect(middles).toEqual([])
    expect(turns).toEqual([])
  })
})

describe('滚轮翻页', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('鼠标滚轮每格翻一页，向上滚翻回上一页', async () => {
    const { turns, wheel, wait } = await mountReader()
    wheel(100)
    wait(300)
    wheel(100)
    wait(300)
    wheel(-100)
    expect(turns).toEqual(['next', 'next', 'prev'])
  })

  it('一次轻扫只翻一页，之后的惯性不再翻页', async () => {
    const { turns, swipe } = await mountReader()
    swipe(2, 40, 0.3, 0.985)
    expect(turns).toEqual(['next'])
  })

  it('惯性还没停时再扫一次，翻到下一页', async () => {
    const { turns, swipe } = await mountReader()
    swipe(2, 40, 4)
    swipe(2, 40, 4)
    swipe(2, 40, 0.3)
    expect(turns).toEqual(['next', 'next', 'next'])
  })

  it('惯性尾巴停在同一个小值上时不翻页', async () => {
    const { turns, swipe, wheel } = await mountReader()
    swipe(2, 40, 1.5)
    for (let index = 0; index < 200; index++) wheel(1)
    expect(turns).toEqual(['next'])
  })
})

describe('卷末边界', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('方向键、PageDown 与空格向后翻，左方向键与 PageUp 向前翻', async () => {
    const { turns, bindings } = await mountReader()
    for (const key of ['ArrowRight', 'PageDown', ' ', 'ArrowLeft', 'PageUp']) bindings.get(key)!()
    expect(turns).toEqual(['next', 'next', 'next', 'prev', 'prev'])
  })

  it('结束页接管翻页时，按键、点击与滚轮都不再翻动书页', async () => {
    const asked: boolean[] = []
    const { turns, methods, bindings, click, wheel } = await mountReader(forward => {
      asked.push(forward)
      return true
    })
    bindings.get('ArrowRight')!()
    bindings.get('ArrowLeft')!()
    click(1, 250)
    wheel(100)
    expect(turns).toEqual([])
    expect(methods).toEqual([])
    expect(asked).toEqual([true, false, true, true])
  })
})

describe('翻页方式', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('点按两侧、滚轮、按键与翻页按钮各自记下翻页方式', async () => {
    const { methods, bindings, click, wheel, wait, input } = await mountReader()
    click(1, 280)
    click(1, 20)
    wait(300)
    wheel(100)
    bindings.get('ArrowRight')!()
    input.turn(true)
    expect(methods).toEqual(['tap', 'tap', 'wheel', 'key', 'button'])
  })
})

describe('焦点在控件上', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('回车与空格留给获得焦点的控件，不交给书页的快捷键', async () => {
    const { element } = await mountReader()
    const reached: string[] = []
    const listen = (event: KeyboardEvent) => reached.push(event.key)
    document.documentElement.addEventListener('keydown', listen)
    const button = document.createElement('button')
    document.body.append(button)
    const page = document.createElement('canvas')
    element.append(page)
    const press = (target: EventTarget, keys: string[]) =>
      keys.forEach(key =>
        target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })),
      )
    press(button, ['Enter', ' ', 'ArrowRight'])
    press(document.body, ['Enter', ' '])
    press(page, [' '])
    document.documentElement.removeEventListener('keydown', listen)
    expect(reached).toEqual(['ArrowRight', 'Enter', ' ', ' '])
  })
})
