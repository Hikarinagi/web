import { describe, expect, it } from 'vitest'

import type { BackendFeedItem } from '../../app/features/feed/feed'
import { withoutSeen } from '../../app/features/feed/useFeedStream'

const item = (type: string, id: number) => ({ type, id }) as unknown as BackendFeedItem

describe('feed 翻页去重', () => {
  // 同一条内容出现两次会撞同一个列表 :key(rowId 就是 `type:id`),Vue 会复用错的
  // DOM 节点。推荐流按实时分数分页,边界上重复吐是可能的。
  it('已经在列表里的条目不再追加一次', () => {
    const current = [item('post', 1), item('post', 2)]
    const incoming = [item('post', 2), item('post', 3)]

    expect(withoutSeen(current, incoming).map(i => i.id)).toEqual([3])
  })

  it('同一页里自己重复也只留一条', () => {
    const incoming = [item('post', 7), item('post', 7)]

    expect(withoutSeen([], incoming)).toHaveLength(1)
  })

  it('类型不同的同号条目是两条内容,不许误杀', () => {
    const incoming = [item('post', 5), item('article', 5)]

    expect(withoutSeen([], incoming)).toHaveLength(2)
  })
})
