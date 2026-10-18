import type { TourPlayContext } from '@hina-ui/vue'
import {
  mangaTourSteps,
  type MangaTourContext,
  type MangaTourScript,
} from '~/components/manga/reader/lib/tour'
import {
  mangaTourPlay,
  type MangaTourDemo,
  type MangaTourEnv,
} from '~/components/manga/reader/lib/tour-plays'

const BASE: MangaTourContext = {
  coarsePointer: false,
  zoomable: true,
  mode: 'paged',
  direction: 'rtl',
  tapSides: true,
  narrow: false,
}

function steps(context: Partial<MangaTourContext>) {
  return mangaTourSteps({ ...BASE, ...context })
}

function keys(context: Partial<MangaTourContext>) {
  return steps(context).map(step => step.key)
}

describe('mangaTourSteps', () => {
  it('adds the zoom step only where the page can zoom', () => {
    expect(keys({})).toEqual(['tap', 'zoom', 'toolbar', 'pager', 'settings'])
    expect(keys({ zoomable: false })).toEqual(['tap', 'toolbar', 'pager', 'settings'])
    expect(keys({ tapSides: false })).toEqual(['swipe', 'zoom', 'toolbar', 'pager', 'settings'])
    expect(keys({ mode: 'scroll' })).toEqual(['scroll', 'toolbar', 'pager', 'settings'])
  })

  it('shows the toolbar only for the pager and settings steps', () => {
    expect(steps({}).map(step => step.chrome)).toEqual([false, false, false, true, true])
  })

  it('points at the side that turns forward', () => {
    const rtl = steps({ direction: 'rtl' })[0]!
    expect(rtl).toMatchObject({ target: 'next', side: 'right', align: 'center', padding: 0 })
    expect(rtl.description).toMatch(/^点击左侧前往下一页，点击右侧回到上一页。/)

    const ltr = steps({ direction: 'ltr' })[0]!
    expect(ltr.side).toBe('left')
    expect(ltr.description).toMatch(/^点击右侧前往下一页，点击左侧回到上一页。/)
  })

  it('places cards for the phone layout', () => {
    expect(steps({ narrow: true, direction: 'rtl' })[0]).toMatchObject({
      side: 'bottom',
      align: 'start',
    })
    expect(steps({ narrow: true, direction: 'ltr' })[0]).toMatchObject({
      side: 'bottom',
      align: 'end',
    })
    expect(steps({ narrow: true }).at(-1)).toMatchObject({ side: 'top', align: 'end' })
    expect(steps({ narrow: false }).at(-1)).toMatchObject({ side: 'bottom', align: 'end' })
  })

  it('matches the other ways to turn to the input device', () => {
    expect(steps({ coarsePointer: true })[0]!.description).toMatch(/也可左右滑动。$/)
    expect(steps({ coarsePointer: false })[0]!.description).toMatch(/也可使用方向键或空格键。$/)
    expect(steps({ coarsePointer: true })[1]!.description).toMatch(/也可使用双指缩放。$/)
    expect(steps({ coarsePointer: false })[1]!.description).toMatch(/按住 Ctrl 并使用鼠标滚轮。$/)
  })

  it('demonstrates on the page once side taps are off', () => {
    const [turning, , toolbar] = steps({ tapSides: false, coarsePointer: true })
    expect(turning).toMatchObject({
      target: 'page',
      description: '向右滑动前往下一页，向左滑动回到上一页。',
    })
    expect(steps({ tapSides: false, coarsePointer: true, direction: 'ltr' })[0]!.description).toBe(
      '向左滑动前往下一页，向右滑动回到上一页。',
    )
    expect(steps({ tapSides: false })[0]!.description).toBe(
      '拖动页面或使用方向键翻页。空格键前往下一页。',
    )
    expect(toolbar).toMatchObject({ target: 'page', description: '点击页面可显示或隐藏工具栏。' })
  })

  it('describes continuous reading and leaves page direction out of the webtoon settings', () => {
    const plan = steps({ mode: 'scroll', coarsePointer: true })
    expect(plan[0]).toMatchObject({
      title: '阅读',
      target: 'page',
      description: '上下滑动即可连续阅读。',
    })
    expect(plan.at(-1)!.description).not.toMatch(/翻页方向/)
  })
})

function harness(options: { page?: number; coarse?: boolean } = {}) {
  const log: string[] = []
  const cleanups: (() => void)[] = []
  let page = options.page ?? 5
  const demo: MangaTourDemo = {
    canTurn: delta => (delta === 1 ? page < 20 : page > 1),
    turn: delta => {
      page += delta
      log.push(`turn ${delta}`)
    },
    pull: () => {},
    release: delta => {
      if (delta === 1 ? page < 20 : page > 1) page += delta
      log.push(`release ${delta}`)
    },
    zoomAt: () => log.push('zoom'),
    pan: () => {},
    scroll: (_dy, smooth) => log.push(smooth ? 'scroll' : 'drag scroll'),
    chrome: visible => log.push(`chrome ${visible}`),
    scrub: value => log.push(`scrub ${value}`),
    thumb: value => ({ x: value * 10, y: 0 }),
    pageAt: x => Math.round(x / 10),
    current: () => page,
    total: () => 20,
    jump: value => log.push(`jump ${value}`),
    settings: value => log.push(`settings ${value}`),
    pageBox: () => ({ left: 0, top: 0, width: 400, height: 600 }),
    pagerBox: () => ({ left: 0, top: 500, width: 400, height: 100 }),
    snapshot: () => () => log.push('restore'),
  }
  const env: MangaTourEnv = {
    demo,
    target: key => key,
    page: () => ({ left: 0, top: 0, width: 400, height: 600 }),
    outline: key => log.push(`outline ${key}`),
    viewport: () => ({ width: 1000, height: 800 }),
    rtl: true,
    coarse: options.coarse ?? false,
  }
  const context: TourPlayContext = {
    step: 1,
    signal: new AbortController().signal,
    defer: cleanup => cleanups.push(cleanup),
    pointer: {
      move: async target => {
        log.push(`move ${typeof target === 'string' ? target : 'point'}`)
      },
      tap: async () => {
        log.push('tap')
      },
      press: async () => {},
      drag: async (_target, _duration, onMove) => {
        onMove?.({ x: 100, y: 100 })
        log.push('drag')
      },
      key: async key => {
        log.push(`key ${key}`)
      },
      hide: async () => {
        log.push('hide')
      },
    },
    spotlight: async target => {
      log.push(`spotlight ${String(target)}`)
    },
    waitFor: async () => true,
    sleep: async () => {},
  }

  async function play(key: MangaTourScript) {
    const step = steps({}).find(item => item.key === key)!
    await mangaTourPlay(step, env)(context)
  }

  return { log, cleanups, play, page: () => page }
}

describe('mangaTourPlay', () => {
  it('taps forward and back, then shows the arrow keys on the page', async () => {
    const { play, cleanups, log } = harness()
    await play('tap')
    expect(log.filter(line => /^(turn|key|outline|spotlight)/.test(line))).toEqual([
      'outline next',
      'spotlight next',
      'turn 1',
      'outline previous',
      'spotlight previous',
      'turn -1',
      'outline page',
      'spotlight page',
      'key ←',
      'turn 1',
      'key →',
      'turn -1',
    ])
    expect(log[0]).toBe('chrome false')
    cleanups.reverse().forEach(cleanup => cleanup())
    expect(log.slice(-2)).toEqual(['outline null', 'restore'])
  })

  it('turns back first on the last page and never past it', async () => {
    const { play, log, page } = harness({ page: 20 })
    await play('tap')
    expect(log.filter(line => line.startsWith('turn'))).toEqual([
      'turn -1',
      'turn 1',
      'turn -1',
      'turn 1',
    ])
    expect(page()).toBe(20)
  })

  it('swipes the page on touch screens', async () => {
    const { play, log } = harness({ coarse: true })
    await play('tap')
    expect(log.filter(line => line.startsWith('release'))).toEqual(['release 1', 'release -1'])
    expect(log.some(line => line.startsWith('key'))).toBe(false)
  })

  it('previews pages along the slider and opens the page jump', async () => {
    const { play, log } = harness()
    await play('pager')
    expect(log).toEqual([
      'chrome true',
      'move point',
      'scrub 10',
      'drag',
      'scrub 10',
      'drag',
      'scrub null',
      'move pageNumber',
      'tap',
      'jump true',
      'spotlight jump',
      'hide',
    ])
  })

  it('opens the settings and moves on to the guide link without tapping it', async () => {
    const { play, log } = harness()
    await play('settings')
    expect(log).toEqual([
      'chrome true',
      'move settings',
      'tap',
      'settings true',
      'spotlight panel',
      'spotlight guide',
      'move guide',
      'hide',
    ])
  })

  it('shows and hides the toolbar from the middle', async () => {
    const { play, log } = harness()
    await play('toolbar')
    expect(log).toEqual([
      'chrome false',
      'move center',
      'tap',
      'chrome true',
      'tap',
      'chrome false',
      'hide',
    ])
  })
})
