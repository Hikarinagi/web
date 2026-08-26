import { describe, expect, it } from 'vitest'
import type { ReaderEducationHint } from '~/components/reader/EducationOverlay.vue'
import { readerEducationHints } from '~/components/hikari-reader/lib/education'
import { mangaEducationHints } from '~/components/manga/reader/lib/education'

function text(hints: readonly ReaderEducationHint[]) {
  return hints.map(hint => `${hint.title} ${hint.description ?? ''}`).join('\n')
}

/**
 * Cards are absolutely positioned by placement once there is room, so a
 * repeated placement stacks two of them on the same spot.
 */
function expectLayoutIsSane(hints: readonly ReaderEducationHint[]) {
  expect(new Set(hints.map(h => h.placement)).size).toBe(hints.length)
  expect(new Set(hints.map(h => h.key)).size).toBe(hints.length)
  expect(hints.length).toBeGreaterThan(0)
}

const LN_CASES = [
  { coarsePointer: true, tapZones: false },
  { coarsePointer: true, tapZones: true },
  { coarsePointer: false, tapZones: false },
  { coarsePointer: false, tapZones: true },
]

describe('readerEducationHints', () => {
  it.each(LN_CASES)('lays out cleanly for %o', context => {
    expectLayoutIsSane(readerEducationHints(context))
  })

  it('never promises swiping or tap-to-toggle to a mouse without tap zones', () => {
    // Neither exists there: Rito binds swiping to touch events, and the tap
    // detector is off unless the pointer is coarse or tap zones are on.
    const copy = text(readerEducationHints({ coarsePointer: false, tapZones: false }))
    expect(copy).not.toMatch(/滑/)
    expect(copy).not.toMatch(/单击|点中间/)
    expect(copy).toMatch(/← →/)
    expect(copy).toMatch(/右键/)
  })

  it('teaches swiping and tap-to-toggle on touch', () => {
    const copy = text(readerEducationHints({ coarsePointer: true, tapZones: false }))
    expect(copy).toMatch(/右滑/)
    expect(copy).toMatch(/左滑/)
    expect(copy).toMatch(/单击 呼出工具栏/)
  })

  it('gives a mouse a paging click only when tap zones are on', () => {
    const copy = text(readerEducationHints({ coarsePointer: false, tapZones: true }))
    expect(copy).toMatch(/点左侧/)
    expect(copy).toMatch(/点右侧/)
    expect(copy).toMatch(/点中间 呼出工具栏/)
  })

  it('matches the selection gesture to the input device', () => {
    expect(text(readerEducationHints({ coarsePointer: true, tapZones: false }))).toMatch(
      /长按 选中文字/,
    )
    expect(text(readerEducationHints({ coarsePointer: false, tapZones: false }))).toMatch(
      /拖选文字/,
    )
  })
})

const MANGA_CASES = [
  { coarsePointer: true, zoomable: true },
  { coarsePointer: true, zoomable: false },
  { coarsePointer: false, zoomable: true },
  { coarsePointer: false, zoomable: false },
]

describe('mangaEducationHints', () => {
  it.each(MANGA_CASES)('lays out cleanly for %o', context => {
    expectLayoutIsSane(mangaEducationHints(context))
  })

  it('drops the zoom card for the layouts that cannot zoom', () => {
    const hints = mangaEducationHints({ coarsePointer: true, zoomable: false })
    expect(hints.some(hint => hint.key === 'zoom')).toBe(false)
  })

  it('only offers pinch to touch', () => {
    expect(text(mangaEducationHints({ coarsePointer: true, zoomable: true }))).toMatch(/捏合/)
    const mouse = text(mangaEducationHints({ coarsePointer: false, zoomable: true }))
    expect(mouse).not.toMatch(/捏合/)
    expect(mouse).toMatch(/双击 缩放/)
  })
})
