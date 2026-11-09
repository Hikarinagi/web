import { describe, expect, it } from 'vitest'
import { lineDiff } from '~/features/wiki/diff'

describe('lineDiff', () => {
  it('keeps the changed lines and one line on each side, counting the rest', () => {
    const before = ['一', '二', '三', '四', '五', '六'].join('\n')
    const after = ['一', '二', '三', '肆', '五', '六'].join('\n')
    expect(lineDiff(before, after)).toEqual([
      { kind: 'gap', count: 2 },
      { kind: 'same', text: '三' },
      { kind: 'removed', text: '四' },
      { kind: 'added', text: '肆' },
      { kind: 'same', text: '五' },
      { kind: 'gap', count: 1 },
    ])
  })

  it('treats a new text as added lines and ignores line ending styles', () => {
    expect(lineDiff('', '甲\r\n乙')).toEqual([
      { kind: 'added', text: '甲' },
      { kind: 'added', text: '乙' },
    ])
    expect(lineDiff('甲\r\n乙', '甲\n乙')).toEqual([{ kind: 'gap', count: 2 }])
  })
})
