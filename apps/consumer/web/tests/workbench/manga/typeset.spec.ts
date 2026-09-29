import { describe, expect, it } from 'vitest'
import {
  fitLayout,
  layoutHorizontal,
  layoutVertical,
  readStyle,
} from '~/features/workbench/manga/typeset'

const measure = (text: string, size: number) => Array.from(text).length * size

describe('manga typeset', () => {
  it('竖排从右往左排列，每列排满后换列，标点换成竖排字形', () => {
    const { fits, glyphs } = layoutVertical('你好，世界。', 100, 40, 10)
    expect(fits).toBe(true)
    expect(glyphs.map(glyph => glyph.text).join('')).toBe('你好︐世界︒')
    expect(glyphs[0]).toEqual({ text: '你', x: 56, y: 5 })
    expect(glyphs[3]).toEqual({ text: '世', x: 56, y: 35 })
    expect(glyphs[4]).toEqual({ text: '界', x: 44, y: 5 })
  })

  it('竖排遇到换行另起一列，列宽放不下时判为放不下', () => {
    const { glyphs } = layoutVertical('一\n二', 100, 100, 10)
    expect(glyphs.map(glyph => glyph.x)).toEqual([56, 44])
    expect(layoutVertical('一二三四五六', 15, 20, 10).fits).toBe(false)
  })

  it('横排按宽度折行，英文单词不拆开，整体居中', () => {
    const { fits, glyphs } = layoutHorizontal('hello world', 60, 100, 10, measure)
    expect(fits).toBe(true)
    expect(glyphs.map(glyph => glyph.text)).toEqual(['hello', 'world'])
    expect(glyphs[0].x).toBe(30)
    expect(glyphs[1].y - glyphs[0].y).toBe(13)
  })

  it('自动字号取能放下的最大值，指定字号时照用', () => {
    const style = readStyle(null, true)
    expect(fitLayout('一二三四', 40, 40, style, measure).size).toBe(18)
    expect(fitLayout('一二三四', 40, 40, { ...style, size: 30 }, measure).size).toBe(30)
  })

  it('样式缺省时按框的形状推断横竖排，其余取默认值', () => {
    expect(readStyle({ vertical: false, font: 'serif', stroke: true }, true)).toEqual({
      vertical: false,
      font: 'serif',
      size: null,
      color: 'black',
      stroke: true,
      fill: false,
    })
    expect(readStyle(null, true).vertical).toBe(true)
  })
})
