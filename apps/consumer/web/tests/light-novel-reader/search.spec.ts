import type { TocEntry } from '@ritojs/core'
import type { SearchResult } from '@ritojs/kit'
import { describe, expect, it } from 'vitest'
import { groupResults, snippet } from '~/features/light-novel-reader/search'
import type { TocRow } from '~/features/light-novel-reader/toc'

const row = (label: string, start: number | null): TocRow => ({
  key: `${label}:${start}`,
  entry: { label, href: `${label}.xhtml`, children: [] } as TocEntry,
  label,
  depth: 0,
  start,
  pages: null,
})

const hit = (pageIndex: number): SearchResult =>
  ({ pageIndex, context: '' }) as unknown as SearchResult

describe('snippet', () => {
  it('命中词前后各保留十四个字，截断处加省略号', () => {
    const before = '一二三四五六七八九十甲乙丙丁戊己'
    const after = '子丑寅卯辰巳午未申酉戌亥天地人'
    const parts = snippet(`${before}流星雨${after}`, '流星雨')

    expect(parts.before).toBe(`…${before.slice(-14)}`)
    expect(parts.match).toBe('流星雨')
    expect(parts.after).toBe(`${after.slice(0, 14)}…`)
  })

  it('上下文够短时不加省略号，去掉中文之间因换行留下的空白', () => {
    expect(snippet('  「今晚的\n流星雨极大期」 ', '流星雨')).toEqual({
      before: '「今晚的',
      match: '流星雨',
      after: '极大期」',
    })
    expect(snippet('众人恐 惧的魔王', '魔王').before).toBe('众人恐惧的')
  })

  it('西文单词之间的空白合并为一个空格', () => {
    expect(snippet('Fate/stay\n  night', 'night').before).toBe('Fate/stay ')
  })

  it('不区分大小写，保留原文的大小写', () => {
    expect(snippet('Fate/stay night', 'STAY').match).toBe('stay')
  })

  it('上下文里找不到关键词时整段原样显示', () => {
    expect(snippet('别的句子', '流星雨')).toEqual({ before: '', match: '', after: '别的句子' })
  })
})

describe('groupResults', () => {
  const rows = [row('序章', 0), row('第一章', 6), row('后记', 40)]

  it('按所在章节连续分组，并记住每条在全部结果里的序号', () => {
    const groups = groupResults([hit(2), hit(7), hit(9), hit(41)], rows)

    expect(groups.map(group => [group.label, group.hits.map(item => item.index)])).toEqual([
      ['序章', [0]],
      ['第一章', [1, 2]],
      ['后记', [3]],
    ])
  })

  it('目录之前的页面归到无标题的一组', () => {
    const groups = groupResults([hit(0)], [row('第一章', 6)])

    expect(groups).toEqual([{ key: '', label: '', hits: [{ index: 0, result: hit(0) }] }])
  })
})
