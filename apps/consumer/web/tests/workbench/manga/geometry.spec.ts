import { describe, expect, it } from 'vitest'
import { boundsOf, rectFrom, shift, sortKeyBetween } from '~/features/workbench/manga/geometry'

describe('manga geometry', () => {
  it('两个角点生成夹在页面内的矩形外框，标记点在中心', () => {
    expect(rectFrom([0.6, 0.5], [0.2, 1.3])).toEqual({
      vertices: [
        [0.2, 0.5],
        [0.6, 0.5],
        [0.6, 1],
        [0.2, 1],
      ],
      x: 0.4,
      y: 0.75,
    })
  })

  it('没有外框的文本框以标记点为范围', () => {
    expect(boundsOf([], 0.3, 0.4)).toEqual({ x0: 0.3, y0: 0.4, x1: 0.3, y1: 0.4 })
  })

  it('移动时整个外框不出页面', () => {
    const box = rectFrom([0.7, 0.1], [0.9, 0.2])
    expect(shift(box.vertices, box.x, box.y, 0.5, -0.5)).toEqual({
      vertices: [
        [0.8, 0],
        [1, 0],
        [1, 0.1],
        [0.8, 0.1],
      ],
      x: 0.9,
      y: 0.05,
    })
  })

  it('排序键取前后两个文本框的中间值', () => {
    expect(sortKeyBetween(undefined, undefined)).toBe(1024)
    expect(sortKeyBetween(1024, undefined)).toBe(2048)
    expect(sortKeyBetween(undefined, 1024)).toBe(0)
    expect(sortKeyBetween(1024, 2048)).toBe(1536)
  })
})
