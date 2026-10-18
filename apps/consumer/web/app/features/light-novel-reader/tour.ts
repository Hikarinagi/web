import type { TourPlayContext, TourPoint, TourRectLike, TourStep } from '@hina-ui/vue'
import type {
  ReaderAnnotationTarget,
  ReaderSemanticNode,
  ReaderSourceRange,
  Rect,
} from '@ritojs/core'
import type { ReaderController } from '@ritojs/kit'
import type { ReaderContext } from './context'
import { HIGHLIGHT_COLORS } from './highlights'

interface TourBox {
  x: number
  y: number
  width: number
  height: number
}

interface TourLine {
  from: number
  to: number
  y: number
  href: string
  range: ReaderSourceRange
  quote: string
  rect: TourBox
}

const DEMO_ID = 'tour-demo'
const WAIT = 2000

function grow(rect: TourBox, padding: number): TourBox {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}

function box(
  element: { getBoundingClientRect(): TourBox } | null | undefined,
  padding = 0,
): TourBox | null {
  return element ? grow(element.getBoundingClientRect(), padding) : null
}

function union(a: TourBox, b: TourBox): TourBox {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  }
}

const middle = (rect: TourBox): TourPoint => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
})

const tag = (name: string) => `[data-tour="${name}"]`
const find = (name: string) => document.querySelector<HTMLElement>(tag(name))

function turned(controller: ReaderController) {
  return new Promise<boolean>(resolve => {
    const off = controller.on('transitionEnd', ({ outcome }) => {
      off()
      resolve(outcome === 'committed')
    })
    setTimeout(() => {
      off()
      resolve(false)
    }, 2500)
  })
}

function flatten(nodes: readonly ReaderSemanticNode[]): ReaderSemanticNode[] {
  return nodes.flatMap(node => [node, ...flatten(node.children)])
}

function fire(canvas: HTMLCanvasElement, type: string, x: number, y: number, buttons: number) {
  canvas.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons,
      clientX: x,
      clientY: y,
    }),
  )
}

export function tourSteps(
  reader: Pick<
    ReaderContext,
    'engine' | 'shell' | 'selection' | 'jumps' | 'highlights' | 'settings' | 'search'
  >,
  context: { phone: boolean; touch: boolean; tapTurn: boolean; guide: boolean },
): TourStep[] {
  const { engine, shell, selection, jumps, highlights, search } = reader
  const { phone, touch, tapTurn } = context
  let sample: { target: ReaderAnnotationTarget; phrase: TourBox; quote: string } | null = null

  const page = () => engine.stack.value?.canvas ?? null

  function zone(build: (page: DOMRect) => TourRectLike) {
    return () => {
      const canvas = page()
      return canvas ? build(canvas.getBoundingClientRect()) : null
    }
  }

  async function still({ signal }: TourPlayContext) {
    const controller = engine.stack.value?.controller
    if (!controller) return
    await new Promise<void>(resolve => {
      let moving = false
      const offs = [
        controller.on('transitionStart', () => (moving = true)),
        controller.on('transitionEnd', () => done()),
      ]
      const timer = setTimeout(() => {
        if (!moving) done()
      }, 200)
      signal.addEventListener('abort', () => done(), { once: true })
      function done() {
        clearTimeout(timer)
        offs.forEach(off => off())
        resolve()
      }
    })
  }

  async function bars(run: TourPlayContext) {
    if (!phone) return
    await still(run)
    if (shell.chrome.value) return
    shell.chrome.value = true
    await run.sleep(260)
  }

  async function aim(run: TourPlayContext, element: HTMLElement | null) {
    if (!element) return
    element.scrollIntoView({ block: 'nearest' })
    await run.spotlight(element, { padding: 6 })
    const rect = element.getBoundingClientRect()
    await run.pointer.move({ x: rect.x + rect.width * 0.62, y: rect.y + rect.height * 0.7 }, 650)
  }

  function point(name: string) {
    return async (run: TourPlayContext) => {
      await bars(run)
      await run.waitFor(tag(name))
      await aim(run, find(name))
    }
  }

  async function probe(from: number, to: number, y: number): Promise<TourLine | null> {
    const stack = engine.stack.value
    if (!stack) return null
    const { controller, canvas } = stack
    const bounds = canvas.getBoundingClientRect()
    const scale = controller.renderScale
    let rects: readonly Rect[] = []
    const off = controller.on('selectionChange', event => {
      rects = event.hasSelection ? event.viewportRects : []
    })
    try {
      fire(canvas, 'pointerdown', from, y, 1)
      fire(canvas, 'pointermove', (from + to) / 2, y, 1)
      fire(canvas, 'pointermove', to, y, 1)
      let quote = ''
      for (let frame = 0; frame < 6 && quote.trim().length < 4; frame += 1) {
        await new Promise(resolve => requestAnimationFrame(resolve))
        quote = controller.selectionText
      }
      const locator = controller.selectionSourceLocator
      const found =
        quote.trim().length >= 4 && locator?.sourceRange && rects.length === 1
          ? {
              from,
              to,
              y,
              href: locator.href,
              range: locator.sourceRange,
              quote,
              rect: rects
                .map(rect => ({
                  x: bounds.x + rect.x * scale,
                  y: bounds.y + rect.y * scale,
                  width: rect.width * scale,
                  height: rect.height * scale,
                }))
                .reduce(union),
            }
          : null
      fire(canvas, 'pointercancel', to, y, 0)
      controller.clearSelection()
      return found
    } finally {
      off()
    }
  }

  async function findLine(run: TourPlayContext) {
    const stack = engine.stack.value
    if (!stack) return null
    const { controller, canvas, reader: book } = stack
    const { margin, fontSize, lineHeight } = reader.settings.device.value
    const start = controller.currentSpread
    const end = Math.min(controller.spreads.length, start + 40)
    for (let spread = start; spread < end; spread += 1) {
      const pages = controller.spreads[spread]?.pageIndexes ?? []
      for (const [side, pageIndex] of pages.entries()) {
        const semantics = await book.interactions?.getPageSemantics?.(pageIndex)
        const node = flatten(semantics?.nodes ?? []).find(
          item => item.role === 'paragraph' && (item.text?.trim().length ?? 0) >= 12,
        )
        if (!node) continue
        if (spread !== controller.currentSpread) {
          await run.spotlight(canvas, { padding: 0 })
          const settled = turned(controller)
          controller.goToSpread(spread)
          await settled
          await run.sleep(250)
        }
        const rect = canvas.getBoundingClientRect()
        const scale = controller.renderScale
        const left =
          rect.left + (rect.width / pages.length) * side + (margin + node.bounds.x) * scale
        const y = rect.top + (margin + node.bounds.y + (fontSize * lineHeight) / 2) * scale
        const from = left + fontSize * 2.4 * scale
        const to = Math.min(left + node.bounds.width * 0.6 * scale, from + fontSize * 14 * scale)
        const line = await probe(from, to, y)
        if (line) return line
      }
    }
    return null
  }

  async function navigation(run: TourPlayContext, tab: string) {
    const before = shell.tab.value
    const opened = phone
      ? 'sheet'
      : shell.medium.value
        ? shell.leftDocked.value
          ? null
          : 'column'
        : 'drawer'
    run.defer(() => {
      if (opened === 'sheet') shell.sheet.value = null
      if (opened === 'drawer') shell.drawer.value = null
      if (opened === 'column' && shell.leftDocked.value) shell.toggleLeft()
      shell.tab.value = before
    })
    shell.tab.value = tab
    if (opened === 'sheet') shell.sheet.value = 'toc'
    if (opened === 'drawer') shell.drawer.value = 'left'
    if (opened === 'column') shell.toggleLeft()
    await run.waitFor(tag('navigation-tabs'))
    if (opened) await run.sleep(480)
  }

  async function turn(run: TourPlayContext) {
    const { pointer, sleep, defer } = run
    const stack = engine.stack.value
    if (!stack) return
    const { controller, canvas } = stack
    const bounds = canvas.getBoundingClientRect()
    const at = {
      x: bounds.x + bounds.width * 0.84,
      y: bounds.y + bounds.height * (phone ? 0.58 : 0.5),
    }
    let state: 'idle' | 'turned' | 'back' = 'idle'
    defer(() => {
      if (state === 'turned') controller.prevSpread()
    })
    const settled = turned(controller)
    if (touch) {
      await pointer.move(at, 700)
      controller.nextSpread()
      await pointer.drag({ x: bounds.x + bounds.width * 0.28, y: at.y }, 420)
    } else if (tapTurn) {
      await pointer.move(at, 700)
      await pointer.tap()
      controller.nextSpread()
    } else {
      const key = pointer.key('→', 900)
      await sleep(260)
      controller.nextSpread()
      await key
    }
    if (!(await settled)) return
    state = 'turned'
    await sleep(1100)
    state = 'back'
    controller.prevSpread()
    await sleep(900)
  }

  async function chrome(run: TourPlayContext) {
    const { pointer, sleep, defer } = run
    const canvas = page()
    if (!canvas) return
    defer(() => (shell.chrome.value = true))
    shell.chrome.value = true
    const bounds = canvas.getBoundingClientRect()
    await pointer.move({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.46 }, 700)
    await pointer.tap()
    shell.chrome.value = false
    await sleep(1000)
    await pointer.tap()
    shell.chrome.value = true
    await sleep(600)
  }

  async function highlight(run: TourPlayContext) {
    const { pointer, sleep, defer, spotlight, signal } = run
    const stack = engine.stack.value
    if (!stack) return
    const { controller, canvas, reader: book } = stack
    defer(() => {
      controller.clearSelection()
      controller.removeAnnotation(DEMO_ID)
    })
    const line = await findLine(run)
    if (!line) return
    const { from, to, y } = line
    await spotlight({ x: from - 24, y: y - 36, width: to - from + 48, height: 72 }, { padding: 0 })
    await pointer.move({ x: from, y }, 750)
    if (touch) await pointer.press(500)
    fire(canvas, 'pointerdown', from, y, 1)
    await pointer.drag({ x: to, y }, 900, at => fire(canvas, 'pointermove', at.x, at.y, 1))
    fire(canvas, 'pointerup', to, y, 0)
    await sleep(380)
    const phrase = box(selection.anchor.value, 10) ?? grow(line.rect, 10)
    const locator = controller.selectionSourceLocator
    const quote = controller.selectionText || line.quote
    const toolbar = box(document.querySelector('[aria-label="选区操作"]'), 10)
    await spotlight(toolbar ? union(phrase, toolbar) : phrase, { padding: 0 })
    await sleep(300)
    const swatch = document.querySelector(`[aria-label="${HIGHLIGHT_COLORS[0].label}高亮"]`)
    if (swatch) {
      await pointer.move(swatch, 650)
      await pointer.tap()
    }
    const target = await book.interactions?.createAnnotationTarget?.(
      locator?.sourceRange
        ? { href: locator.href, sourceRange: locator.sourceRange }
        : { href: line.href, sourceRange: line.range },
    )
    if (!target || signal.aborted) return
    controller.clearSelection()
    controller.insertAnnotation({
      id: DEMO_ID,
      kind: 'highlight',
      target,
      color: HIGHLIGHT_COLORS[0].value,
      createdAt: Date.now(),
    })
    sample = { target, phrase, quote }
    await spotlight(phrase, { padding: 0 })
    await pointer.move({ x: phrase.x + phrase.width + 24, y: phrase.y + phrase.height + 28 }, 600)
  }

  async function inspect(run: TourPlayContext) {
    const { pointer, sleep, defer, spotlight, waitFor } = run
    const stack = engine.stack.value
    if (!stack) return
    const { controller, reader: book } = stack
    defer(() => {
      highlights.inspector.open = false
      highlights.preview.value = null
      controller.removeAnnotation(DEMO_ID)
    })
    if (!sample) {
      const line = await findLine(run)
      const target =
        line &&
        (await book.interactions?.createAnnotationTarget?.({
          href: line.href,
          sourceRange: line.range,
        }))
      if (!line || !target) return
      sample = { target, phrase: grow(line.rect, 10), quote: line.quote }
    }
    const { target, phrase, quote } = sample
    controller.insertAnnotation({
      id: DEMO_ID,
      kind: 'highlight',
      target,
      color: HIGHLIGHT_COLORS[0].value,
      createdAt: Date.now(),
    })
    await spotlight(phrase, { padding: 0 })
    await pointer.move(middle(phrase), 700)
    await pointer.tap()
    highlights.preview.value = {
      id: DEMO_ID,
      serverId: null,
      target,
      quote,
      color: HIGHLIGHT_COLORS[0].value,
      note: '',
      createdAt: Date.now(),
      failed: false,
    }
    highlights.inspect(DEMO_ID, {
      getBoundingClientRect: () => new DOMRect(phrase.x, phrase.y, phrase.width, phrase.height),
      contextElement: stack.canvas,
    })
    if (!(await waitFor(tag('inspector')))) return
    await sleep(phone ? 360 : 160)
    const panel = find('inspector')
    if (!panel) return
    await spotlight(panel, { padding: 4 })
    for (const part of [
      panel.querySelector<HTMLElement>('[aria-label="高亮颜色"]'),
      panel.querySelector<HTMLElement>('textarea'),
      [...panel.querySelectorAll('button')].find(item => item.textContent?.includes('删除')),
    ]) {
      const rect = box(part)
      if (!rect) continue
      await pointer.move({ x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.6 }, 600)
      await sleep(500)
    }
  }

  async function tabs(run: TourPlayContext) {
    const { pointer, sleep, spotlight } = run
    await navigation(run, 'toc')
    const list = find('navigation-tabs')
    if (!list) return
    await spotlight(list, { padding: 6 })
    for (const [name, value] of [
      ['书签', 'bookmarks'],
      ['高亮', 'highlights'],
      ['搜索', 'search'],
      ['目录', 'toc'],
    ] as const) {
      const trigger = [...list.querySelectorAll<HTMLElement>('[role="tab"]')].find(item =>
        item.textContent?.trim().startsWith(name),
      )
      if (!trigger) continue
      await pointer.move(trigger, 600)
      await pointer.tap()
      shell.tab.value = value
      await sleep(700)
    }
  }

  async function jump(run: TourPlayContext) {
    const { pointer, sleep, defer, spotlight, waitFor } = run
    await navigation(run, 'toc')
    await nextTick()
    const toc = document.querySelector('nav[aria-label="目录"]')
    const rows = [...(toc?.querySelectorAll('button') ?? [])]
    const current = rows.findIndex(row => row.getAttribute('aria-current') === 'page')
    const row = rows[current + 1] ?? rows[current - 1]
    let jumped = false
    defer(() => {
      if (jumped && jumps.target.value) jumps.back()
    })
    if (!row) return
    row.scrollIntoView({ block: 'nearest' })
    await spotlight(row, { padding: 6 })
    await pointer.move(row, 700)
    await pointer.tap()
    row.click()
    jumped = true
    if (!(await waitFor(tag('return')))) return
    await sleep(phone ? 900 : 700)
    const back = find('return')
    if (!back) return
    await spotlight(back, { padding: 6 })
    await pointer.move(back, 700)
    await pointer.tap()
    back.click()
    jumped = false
    await sleep(1000)
  }

  async function word() {
    const stack = engine.stack.value
    if (!stack) return null
    const pageIndex = stack.controller.spreads[stack.controller.currentSpread]?.pageIndexes[0]
    if (pageIndex == null) return null
    const semantics = await stack.reader.interactions?.getPageSemantics?.(pageIndex)
    for (const node of flatten(semantics?.nodes ?? [])) {
      const found = /\p{Script=Han}{2}/u.exec(node.text ?? '')
      if (found) return found[0]
    }
    return null
  }

  async function type(run: TourPlayContext, text: string) {
    for (const char of text) {
      search.query.value += char
      await run.sleep(220)
    }
  }

  async function searching(run: TourPlayContext) {
    const { pointer, sleep, defer, spotlight, waitFor } = run
    const query = await word()
    if (!query) return
    const tab = shell.tab.value
    const left = shell.stored.value.left
    const mark = jumps.target.value
    defer(() => {
      search.close()
      shell.sheet.value = null
      shell.tab.value = tab
      if (!phone && shell.stored.value.left !== left) shell.toggleLeft()
      while (jumps.target.value && jumps.target.value !== mark) jumps.back()
    })
    const results = `${tag('search-results')} [role="option"]`
    if (phone) {
      await bars(run)
      await aim(run, find('search'))
      await pointer.tap()
      search.query.value = query.slice(0, 1)
      shell.tab.value = 'search'
      shell.sheet.value = 'toc'
      await sleep(480)
      await type(run, query.slice(1))
      if (!(await waitFor(results, 6000))) return
      await spotlight(tag('search-results'), { padding: 4 })
      await pointer.move(results, 600)
      await pointer.tap()
      document.querySelector<HTMLElement>(results)?.click()
      if (!(await waitFor(tag('search-bar')))) return
      await sleep(600)
      await spotlight(tag('search-bar'), { padding: 4 })
      const next = document.querySelector<HTMLElement>(`${tag('search-bar')} [aria-label="下一处"]`)
      if (!next) return
      await pointer.move(next, 600)
      await pointer.tap()
      search.step(true)
      await sleep(1000)
      return
    }
    const modifier = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'
    await pointer.key(`${modifier} F`, 700)
    search.open()
    await type(run, query)
    if (!(await waitFor(results, 6000))) return
    await sleep(400)
    await spotlight(tag('search-results'), { padding: 4 })
    await pointer.key('Enter', 700)
    search.step(true)
    await sleep(1200)
  }

  async function volumes(run: TourPlayContext) {
    const { pointer, sleep, defer, spotlight, waitFor } = run
    await bars(run)
    defer(() => (shell.volumes.value = false))
    await aim(run, find('volume'))
    await pointer.tap()
    shell.volumes.value = true
    if (!(await waitFor('[role="menu"]'))) return
    await sleep(160)
    const menu = document.querySelector<HTMLElement>('[role="menu"]')
    if (!menu) return
    await spotlight(menu, { padding: 4 })
    const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
    const checked = items.findIndex(item => item.getAttribute('aria-checked') === 'true')
    const other = items[checked + 1] ?? items[checked - 1]
    if (other) await pointer.move(other, 650)
  }

  async function settings(run: TourPlayContext) {
    const { sleep, defer, waitFor } = run
    const shown = phone ? shell.sheet.value === 'settings' : shell.rightDocked.value === 'settings'
    defer(() => {
      if (phone) shell.sheet.value = null
      else if (!shown) shell.togglePanel('settings')
    })
    if (phone) shell.sheet.value = 'settings'
    else if (!shown) shell.togglePanel('settings')
    if (!(await waitFor(tag('settings-theme')))) return
    if (!shown) await sleep(480)
    for (const name of ['settings-theme', 'settings-size', 'settings-tap']) {
      const element = find(name)
      if (!element) continue
      element.scrollIntoView({ block: 'center' })
      await sleep(120)
      await aim(run, element)
      await sleep(700)
    }
  }

  const steps: (TourStep | false)[] = [
    {
      target: zone(bounds =>
        phone
          ? {
              x: bounds.x + (bounds.width * 2) / 3,
              y: bounds.y + bounds.height * 0.36,
              width: bounds.width / 3,
              height: bounds.height * 0.44,
            }
          : {
              x: bounds.x + (bounds.width * 2) / 3,
              y: bounds.y + bounds.height * 0.08,
              width: bounds.width / 3,
              height: bounds.height * 0.84,
            },
      ),
      title: '翻页',
      description: touch
        ? tapTurn
          ? '向左滑动或点击右侧翻到下一页'
          : '向左滑动翻到下一页'
        : tapTurn
          ? '点击右侧或按 → 键翻到下一页'
          : '按 → 键、空格或滚轮翻到下一页',
      side: phone ? 'top' : 'left',
      padding: 0,
      play: turn,
    },
    phone && {
      target: zone(bounds => ({
        x: bounds.x + bounds.width / 3,
        y: bounds.y + bounds.height * 0.28,
        width: bounds.width / 3,
        height: bounds.height * 0.36,
      })),
      title: '工具栏',
      description: '点页面中间显示或隐藏工具栏',
      side: 'bottom',
      padding: 0,
      play: chrome,
    },
    {
      target: page,
      title: '高亮',
      description: touch ? '长按选字，点颜色即可高亮' : '拖选文字，点颜色即可高亮',
      side: 'bottom',
      padding: 0,
      play: highlight,
    },
    {
      target: () => sample?.phrase ?? page(),
      title: '高亮详情',
      description: '点高亮可以改色、写笔记或删除',
      side: phone ? 'top' : 'right',
      padding: 0,
      play: inspect,
    },
    {
      target: tag('navigation-tabs'),
      title: '导航',
      description: '目录、书签、高亮和搜索结果都在这里',
      side: phone ? 'top' : 'right',
      wait: WAIT,
      play: tabs,
    },
    {
      target: () => document.querySelector('nav[aria-label="目录"] [aria-current="page"]'),
      title: '跳转与返回',
      description: '点目录跳转，点返回回到原处',
      side: phone ? 'top' : 'right',
      wait: WAIT,
      play: jump,
    },
    {
      target: tag('search'),
      title: '搜索',
      description: phone
        ? '在全书中搜索，点结果跳过去，用底部的搜索条逐处查看'
        : '按 ⌘F 或 Ctrl F 在全书中搜索，回车跳到下一处',
      side: phone ? 'top' : 'bottom',
      wait: WAIT,
      play: searching,
    },
    {
      target: tag('bookmark'),
      title: '书签',
      description: '为当前页加书签',
      side: 'bottom',
      wait: WAIT,
      play: point('bookmark'),
    },
    {
      target: tag('volume'),
      title: '切换分卷',
      description: '切换本系列的其他分卷，并查看各卷进度',
      side: phone ? 'bottom' : 'right',
      wait: WAIT,
      play: volumes,
    },
    {
      target: tag('progress'),
      title: '阅读进度',
      description: '进度会同步到其他设备',
      side: 'top',
      wait: WAIT,
      play: point('progress'),
    },
    {
      target: tag('settings-theme'),
      title: '阅读设置',
      description: '主题、字号和翻页方式都在这里调整',
      side: phone ? 'top' : 'left',
      wait: WAIT,
      play: settings,
    },
    context.guide && {
      target: tag('guide'),
      title: '操作指引',
      description: '随时点这里重看引导',
      side: 'bottom',
      wait: WAIT,
      play: point('guide'),
    },
  ]
  return steps.filter(step => step !== false)
}
