import type { TourPlay, TourPlayContext, TourPoint, TourTarget } from '@hina-ui/vue'
import type { MangaTourScript, MangaTourStep, MangaTourTarget } from './tour'

export type MangaTourTurn = 1 | -1

export interface MangaTourBox {
  left: number
  top: number
  width: number
  height: number
}

export interface MangaTourDemo {
  canTurn: (delta: MangaTourTurn) => boolean
  turn: (delta: MangaTourTurn) => void
  pull: (dx: number) => void
  release: (delta: MangaTourTurn) => void
  zoomAt: (point: TourPoint) => void
  pan: (dx: number, dy: number) => void
  scroll: (dy: number, smooth: boolean) => void
  chrome: (visible: boolean) => void
  scrub: (page: number | null) => void
  thumb: (page: number) => TourPoint | null
  pageAt: (x: number) => number | null
  current: () => number
  total: () => number
  jump: (open: boolean) => void
  settings: (open: boolean) => void
  pageBox: () => MangaTourBox | null
  pagerBox: () => MangaTourBox | null
  snapshot: () => () => void
}

export interface MangaTourEnv {
  demo: MangaTourDemo
  target: (key: MangaTourTarget) => TourTarget
  page: () => MangaTourBox | null
  outline: (key: MangaTourTarget | null) => void
  viewport: () => { width: number; height: number }
  rtl: boolean
  coarse: boolean
}

type Play = (context: TourPlayContext, env: MangaTourEnv, step: MangaTourStep) => Promise<void>

const PAUSE_MS = 700

function turnOrder(env: MangaTourEnv): MangaTourTurn[] {
  return env.demo.canTurn(1) ? [1, -1] : [-1, 1]
}

async function tapTurns(context: TourPlayContext, env: MangaTourEnv, order: MangaTourTurn[]) {
  for (const delta of order) {
    const zone = delta === 1 ? 'next' : 'previous'
    env.outline(zone)
    await context.spotlight(env.target(zone), { padding: 0 })
    await context.pointer.move(env.target(zone))
    await context.pointer.tap()
    if (env.demo.canTurn(delta)) env.demo.turn(delta)
    await context.sleep(PAUSE_MS)
  }
}

async function swipeTurns(context: TourPlayContext, env: MangaTourEnv, order: MangaTourTurn[]) {
  const { width, height } = env.viewport()
  const box = env.page()
  const y = box ? box.top + box.height / 2 : height / 2
  const forward = env.rtl ? 1 : -1
  const half = (width * 0.36) / 2
  for (const delta of order) {
    const from = { x: width / 2 - delta * forward * half, y }
    const to = { x: width / 2 + delta * forward * half, y }
    await context.pointer.move(from)
    await context.pointer.drag(to, 700, point => env.demo.pull(point.x - from.x))
    env.demo.release(delta)
    await context.sleep(PAUSE_MS)
  }
}

async function keyTurns(context: TourPlayContext, env: MangaTourEnv, order: MangaTourTurn[]) {
  await context.pointer.hide()
  for (const delta of order) {
    await Promise.all([
      context.pointer.key((delta === 1) === env.rtl ? '←' : '→'),
      context.sleep(250).then(() => {
        if (env.demo.canTurn(delta)) env.demo.turn(delta)
      }),
    ])
    await context.sleep(400)
  }
}

const PLAYS: Record<MangaTourScript, Play> = {
  async tap(context, env) {
    const order = turnOrder(env)
    await tapTurns(context, env, order)
    env.outline('page')
    await context.spotlight(env.target('page'), { padding: 0 })
    if (env.coarse) await swipeTurns(context, env, order)
    else await keyTurns(context, env, order)
    await context.pointer.hide()
  },
  async swipe(context, env) {
    const order = turnOrder(env)
    if (env.coarse) {
      await swipeTurns(context, env, order)
    } else {
      await swipeTurns(context, env, order.slice(0, 1))
      await keyTurns(context, env, order.slice(1))
    }
    await context.pointer.hide()
  },
  async scroll(context, env) {
    const { width, height } = env.viewport()
    const box = env.page()
    const x = box ? box.left + box.width / 2 : width / 2
    if (env.coarse) {
      const low = { x, y: height * 0.68 }
      const high = { x, y: height * 0.32 }
      let last = low.y
      const follow = (point: TourPoint) => {
        env.demo.scroll(last - point.y, false)
        last = point.y
      }
      await context.pointer.move(low)
      await context.pointer.drag(high, 900, follow)
      await context.sleep(500)
      await context.pointer.drag(low, 900, follow)
    } else {
      await context.pointer.move({ x, y: height / 2 })
      env.demo.scroll(height / 2, true)
      await context.sleep(1500)
      env.demo.scroll(-height / 2, true)
      await context.sleep(1000)
    }
    await context.pointer.hide()
  },
  async zoom(context, env) {
    const box = env.page()
    if (!box) return
    const point = { x: box.left + box.width / 2, y: box.top + box.height * 0.32 }
    const moved = { x: point.x + 60, y: point.y + 80 }
    let last = point
    await context.pointer.move(point)
    await context.pointer.tap()
    await context.pointer.tap()
    env.demo.zoomAt(point)
    await context.sleep(PAUSE_MS)
    await context.pointer.drag(moved, 600, next => {
      env.demo.pan(next.x - last.x, next.y - last.y)
      last = next
    })
    await context.sleep(500)
    await context.pointer.tap()
    await context.pointer.tap()
    env.demo.zoomAt(moved)
    await context.sleep(400)
    await context.pointer.hide()
  },
  async toolbar(context, env, step) {
    await context.pointer.move(env.target(step.target))
    await context.pointer.tap()
    env.demo.chrome(true)
    await context.sleep(1300)
    await context.pointer.tap()
    env.demo.chrome(false)
    await context.sleep(300)
    await context.pointer.hide()
  },
  async pager(context, env) {
    const start = env.demo.current()
    const span = Math.round((env.demo.total() - 1) * 0.4)
    const end = start + span <= env.demo.total() ? start + span : Math.max(1, start - span)
    const from = env.demo.thumb(start)
    const to = env.demo.thumb(end)
    if (span > 0 && from && to) {
      const follow = (point: TourPoint) => env.demo.scrub(env.demo.pageAt(point.x))
      await context.pointer.move(from)
      await context.pointer.drag(to, 1200, follow)
      await context.sleep(600)
      await context.pointer.drag(from, 800, follow)
      env.demo.scrub(null)
      await context.sleep(300)
    }
    await context.pointer.move(env.target('pageNumber'))
    await context.pointer.tap()
    env.demo.jump(true)
    if (await context.waitFor(env.target('jump'), 1500)) {
      await context.spotlight(env.target('jump'))
    }
    await context.sleep(1500)
    await context.pointer.hide()
  },
  async settings(context, env) {
    await context.pointer.move(env.target('settings'))
    await context.pointer.tap()
    env.demo.settings(true)
    if (await context.waitFor(env.target('panel'), 1500)) {
      await context.spotlight(env.target('panel'))
      await context.sleep(1600)
      await context.spotlight(env.target('guide'), { padding: 4 })
      await context.pointer.move(env.target('guide'))
      await context.sleep(900)
    }
    await context.pointer.hide()
  },
}

export function mangaTourPlay(step: MangaTourStep, env: MangaTourEnv): TourPlay {
  return async context => {
    context.defer(env.demo.snapshot())
    context.defer(() => env.outline(null))
    env.demo.chrome(step.chrome)
    await PLAYS[step.key](context, env, step)
  }
}
