import type { Reader, TocEntry } from '@ritojs/core'
import { describe, expect, it } from 'vitest'
import { rowAt, spineIndexOf, tocRows } from '~/features/light-novel-reader/toc'

const entry = (label: string, href: string, children: TocEntry[] = []): TocEntry => ({
  label,
  href,
  children,
})

const toc = [
  entry(' 彩页 ', 'Text/insert.xhtml'),
  entry('第一章', 'Text/ch1.xhtml', [
    entry('一', 'Text/ch1.xhtml#a'),
    entry('二', 'Text/ch1.xhtml#b'),
  ]),
  entry('后记', 'Text/afterword.xhtml'),
]

const starts = new Map([
  ['Text/insert.xhtml', 0],
  ['Text/ch1.xhtml', 6],
  ['Text/ch1.xhtml#a', 6],
  ['Text/ch1.xhtml#b', 20],
  ['Text/afterword.xhtml', 40],
])

const reader = {
  toc,
  pageCount: 44,
  findPage: (item: TocEntry) => starts.get(item.href),
  manifestHrefMap: new Map([
    ['insert', 'Text/insert.xhtml'],
    ['ch1', 'Text/ch1.xhtml'],
    ['afterword', 'Text/afterword.xhtml'],
  ]),
} as unknown as Reader

describe('tocRows', () => {
  it('lists every entry in reading order with its depth and trimmed label', () => {
    const rows = tocRows(reader, false)
    expect(rows.map(row => [row.label, row.depth])).toEqual([
      ['彩页', 0],
      ['第一章', 0],
      ['一', 1],
      ['二', 1],
      ['后记', 0],
    ])
    expect(rows.every(row => row.start === null && row.pages === null)).toBe(true)
  })

  it('counts the pages up to the next entry once the whole book is laid out', () => {
    const rows = tocRows(reader, true)
    expect(rows.map(row => [row.label, row.start, row.pages])).toEqual([
      ['彩页', 0, 6],
      ['第一章', 6, 14],
      ['一', 6, 14],
      ['二', 20, 20],
      ['后记', 40, 4],
    ])
  })
})

describe('rowAt', () => {
  it('finds the deepest entry a page reads under', () => {
    const rows = tocRows(reader, true)
    expect(rowAt(rows, 3)?.label).toBe('彩页')
    expect(rowAt(rows, 6)?.label).toBe('一')
    expect(rowAt(rows, 25)?.label).toBe('二')
    expect(rowAt(rows, 43)?.label).toBe('后记')
  })
})

describe('spineIndexOf', () => {
  it('reports the spine index of a chapter href', () => {
    expect(spineIndexOf(reader, 'Text/ch1.xhtml')).toBe(1)
    expect(spineIndexOf(reader, 'Text/missing.xhtml')).toBeUndefined()
    expect(spineIndexOf(reader, undefined)).toBeUndefined()
  })
})
