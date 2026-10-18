import type { AnnotationRecord } from '@ritojs/kit'
import { describe, expect, it } from 'vitest'
import {
  diffRecords,
  groupByChapter,
  highlightColor,
  isTarget,
  legacyRange,
  toMarkdown,
} from '~/features/light-novel-reader/highlights'

const target = {
  version: 1 as const,
  href: 'Text/ch1.xhtml',
  sourceRange: {
    start: { nodePath: [1, 0], textOffset: 2 },
    end: { nodePath: [1, 0], textOffset: 6 },
  },
  quote: { exact: '月色真美', prefix: '', suffix: '' },
  position: { start: 2, end: 6, chapterLength: 100 },
}

const record = (id: string, color?: string, note?: string): AnnotationRecord => ({
  id,
  kind: 'highlight',
  target,
  createdAt: 1,
  ...(color === undefined ? {} : { color }),
  ...(note === undefined ? {} : { note }),
})

describe('高亮颜色', () => {
  it('App 存的十六进制色按顺序换成网页的五色', () => {
    expect(highlightColor('#FFE58F')).toBe('rgba(250, 204, 21, 0.35)')
    expect(highlightColor('#D3ADF7')).toBe('rgba(167, 139, 250, 0.35)')
  })

  it('网页存的 rgba 不论空格写法都认得', () => {
    expect(highlightColor('rgba(74,222,128,0.35)')).toBe('rgba(74, 222, 128, 0.35)')
  })

  it('其他十六进制色按 35% 透明度换算，不会盖住文字', () => {
    expect(highlightColor('#ffeb3b')).toBe('rgba(255, 235, 59, 0.35)')
  })

  it('没有颜色时用黄色', () => {
    expect(highlightColor(null)).toBe('rgba(250, 204, 21, 0.35)')
  })
})

describe('标注目标', () => {
  it('只有带 version 1 的才是现行格式', () => {
    expect(isTarget(target)).toBe(true)
    expect(isTarget({ href: 'Text/ch1.xhtml', selectors: {} })).toBe(false)
  })

  it('从 Rito 2.0 的旧目标里取出章节与原文范围', () => {
    const old = {
      href: 'chapter-1',
      selectors: {
        sourceRange: { type: 'SourceRangeSelector', ...target.sourceRange },
        textQuote: { type: 'TextQuoteSelector', exact: '月色真美' },
      },
    }
    expect(legacyRange(old)).toEqual({ href: 'chapter-1', sourceRange: target.sourceRange })
    expect(legacyRange(target)).toBeNull()
  })
})

describe('高亮列表分组', () => {
  const spine = ['Text/cover.xhtml', 'Text/ch1.xhtml', 'Text/ch1b.xhtml', 'Text/ch2.xhtml']
  const spineOf = (href: string) => {
    const index = spine.indexOf(href)
    return index < 0 ? undefined : index
  }
  const chapters = [
    { label: '第一章', href: 'Text/ch1.xhtml' },
    { label: '第一节', href: 'Text/ch1.xhtml#s1' },
    { label: '第二章', href: 'Text/ch2.xhtml' },
  ]
  const at = (id: string, href: string, start: number) => ({
    id,
    target: { ...target, href, position: { start, end: start + 2, chapterLength: 100 } },
  })

  it('按书中位置排序，归入所在章节；没进目录的文件跟随前一章', () => {
    const groups = groupByChapter(
      [at('c', 'Text/ch2.xhtml', 5), at('b', 'Text/ch1b.xhtml', 9), at('a', 'Text/ch1.xhtml', 30)],
      spineOf,
      chapters,
    )
    expect(groups.map(group => [group.label, group.items.map(item => item.id)])).toEqual([
      ['第一章', ['a', 'b']],
      ['第二章', ['c']],
    ])
  })

  it('原文已变更的高亮不参与分组', () => {
    const groups = groupByChapter(
      [{ id: 'x', target: null }, at('a', 'Text/ch1.xhtml', 1)],
      spineOf,
      chapters,
    )
    expect(groups.flatMap(group => group.items.map(item => item.id))).toEqual(['a'])
  })
})

describe('导出 Markdown', () => {
  it('按章节输出引文与笔记，引文逐行加引用符号', () => {
    const text = toMarkdown('少年阴阳师 第 1 卷', [
      { label: '第一章', items: [{ quote: '月色真美\n今晚', note: '回来重读' }] },
      { label: '', items: [{ quote: '小怪', note: '' }] },
    ])
    expect(text).toBe(
      [
        '# 少年阴阳师 第 1 卷',
        '## 第一章',
        '> 月色真美\n> 今晚\n\n回来重读',
        '## 未命名章节',
        '> 小怪',
      ].join('\n\n') + '\n',
    )
  })
})

describe('与服务端比对', () => {
  const synced = new Map([
    ['a', { color: 'rgba(250, 204, 21, 0.35)', note: '笔记' }],
    ['b', { color: 'rgba(74, 222, 128, 0.35)', note: '' }],
  ])

  it('只改颜色时只提交颜色，笔记不随之提交', () => {
    const { changed } = diffRecords(synced, [
      record('a', 'rgba(96, 165, 250, 0.35)', '笔记'),
      record('b', 'rgba(74, 222, 128, 0.35)'),
    ])
    expect(changed).toEqual([
      {
        record: record('a', 'rgba(96, 165, 250, 0.35)', '笔记'),
        color: 'rgba(96, 165, 250, 0.35)',
      },
    ])
  })

  it('只改笔记时只提交笔记', () => {
    const { changed } = diffRecords(synced, [
      record('a', 'rgba(250, 204, 21, 0.35)', '笔记'),
      record('b', 'rgba(74, 222, 128, 0.35)', '新笔记'),
    ])
    expect(changed.map(({ color, note }) => ({ color, note }))).toEqual([
      { color: undefined, note: '新笔记' },
    ])
  })

  it('新出现的记录要新建，消失的记录要删除', () => {
    const { created, removed } = diffRecords(synced, [
      record('a', 'rgba(250, 204, 21, 0.35)', '笔记'),
      record('c', 'rgba(250, 204, 21, 0.35)'),
    ])
    expect(created.map(item => item.id)).toEqual(['c'])
    expect(removed).toEqual(['b'])
  })
})
