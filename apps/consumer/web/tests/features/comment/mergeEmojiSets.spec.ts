import { describe, expect, it } from 'vitest'
import { mergeEmojiSets, type CommentEmojiSets } from '../../../app/features/comment/comment'

type Sets = CommentEmojiSets
type Em = Sets[number]['emojis'][number]

function emoji(id: number, name: string, src: string): Em {
  return { id, name, src } as unknown as Em
}

function set(id: number, name: string, emojis: Em[]): Sets[number] {
  return { id, name, visibility: 'PUBLIC', subscribable: false, emojis } as unknown as Sets[number]
}

describe('mergeEmojiSets', () => {
  it('unions emojis when the same set id is partial on one side (edit-sticker bug)', () => {
    // 既有线程只携带后端按已用 code 裁剪出的「部分集」(只有 happy)
    const existing: Sets = [set(5, 'setA', [emoji(1, 'happy', '/happy.webp')])]
    // 编辑时新选了 laugh,picker 把目录里的完整集快照进 doc
    const docSnapshot: Sets = [
      set(5, 'setA', [emoji(1, 'happy', '/happy.webp'), emoji(2, 'laugh', '/laugh.webp')]),
    ]

    const merged = mergeEmojiSets(existing, docSnapshot)

    expect(merged).toHaveLength(1)
    expect(merged[0]!.emojis.map(e => e.id).sort()).toEqual([1, 2])
    // 新增表情的 src 必须保留,否则渲染无 src(刷新前)
    expect(merged[0]!.emojis.find(e => e.id === 2)?.src).toBe('/laugh.webp')
  })

  it('keeps sets with distinct ids', () => {
    const merged = mergeEmojiSets(
      [set(1, 'a', [emoji(10, 'x', '/x.webp')])],
      [set(2, 'b', [emoji(20, 'y', '/y.webp')])],
    )
    expect(merged.map(s => s.id).sort()).toEqual([1, 2])
  })

  it('does not duplicate an emoji present on both sides', () => {
    const merged = mergeEmojiSets(
      [set(1, 'a', [emoji(10, 'x', '/x.webp')])],
      [set(1, 'a', [emoji(10, 'x', '/x.webp')])],
    )
    expect(merged).toHaveLength(1)
    expect(merged[0]!.emojis).toHaveLength(1)
  })
})
