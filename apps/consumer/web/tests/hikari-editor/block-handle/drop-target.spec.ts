import { describe, expect, it } from 'vitest'
import {
  dropTargetIn,
  type BlockBox,
} from '../../../app/components/hikari-editor/block-handle/drag/target'

function box(pos: number, size: number, top: number, height: number): BlockBox {
  return { pos, end: pos + size, top, bottom: top + height, left: 200, width: 600 }
}

const boxes: BlockBox[] = [box(0, 10, 100, 40), box(10, 10, 140, 40), box(20, 10, 180, 40)]

describe('dropTargetIn 用缓存的块盒算落点', () => {
  it('在第一块上半部分：落到最前面', () => {
    expect(dropTargetIn(boxes, 105)?.pos).toBe(0)
  })

  it('在第一块下半部分：落到第一块之后', () => {
    expect(dropTargetIn(boxes, 135)?.pos).toBe(10)
  })

  it('在中间块下半部分：落到它之后', () => {
    expect(dropTargetIn(boxes, 175)?.pos).toBe(20)
  })

  it('在最后一块下半部分：落到文档末尾', () => {
    expect(dropTargetIn(boxes, 215)?.pos).toBe(30)
  })

  it('远在所有块下方：仍然落到末尾，不返回 null', () => {
    expect(dropTargetIn(boxes, 9999)?.pos).toBe(30)
  })

  it('远在所有块上方：落到最前面', () => {
    expect(dropTargetIn(boxes, -9999)?.pos).toBe(0)
  })

  it('指示线的 y 用的是落点那条边，不是鼠标位置', () => {
    expect(dropTargetIn(boxes, 105)?.top).toBe(100)
    expect(dropTargetIn(boxes, 135)?.top).toBe(140)
  })

  it('指示线宽度取目标块自己的盒，不是编辑器宽度', () => {
    const narrow: BlockBox[] = [{ pos: 0, end: 10, top: 0, bottom: 40, left: 50, width: 120 }]
    const at = dropTargetIn(narrow, 5)
    expect(at?.left).toBe(50)
    expect(at?.width).toBe(120)
  })

  it('空文档返回 null', () => {
    expect(dropTargetIn([], 100)).toBeNull()
  })

  it('恰好落在中线上时归入下半部分', () => {
    expect(dropTargetIn(boxes, 120)?.pos).toBe(10)
  })
})
