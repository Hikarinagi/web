import { describe, expect, it } from 'vitest'
import {
  clusterFeed,
  feedGroupSummary,
  foldFeed,
  type BackendFeedItem,
  type FeedGroup,
  type FeedRow,
} from '../../../app/features/feed/feed'

type StatusType = 'galgame_status' | 'light_novel_status' | 'manga_status'

function status(
  id: number,
  authorId: number | null,
  type: StatusType = 'galgame_status',
  st = 'COMPLETED',
): BackendFeedItem {
  return {
    type,
    id,
    sort_time: new Date(id).toISOString(),
    author: authorId == null ? null : { id: authorId, name: `u${authorId}`, avatar: null },
    status: st,
    time_to_finish_minutes: 0,
    work_ref: {
      id,
      title: `w${id}`,
      work_type: 'GALGAME',
      producer: null,
      year: null,
      cover: null,
      nsfw: false,
    },
  } as unknown as BackendFeedItem
}

function post(id: number, authorId: number): BackendFeedItem {
  return {
    type: 'post',
    id,
    sort_time: new Date(id).toISOString(),
    author: { id: authorId, name: `u${authorId}`, avatar: null },
  } as unknown as BackendFeedItem
}

describe('foldFeed', () => {
  it('folds a run of >=3 same-author same-type status into one group', () => {
    const rows = foldFeed([status(1, 7), status(2, 7), status(3, 7)])
    expect(rows).toHaveLength(1)
    expect(rows[0]!.kind).toBe('group')
    const group = (rows[0] as { kind: 'group'; group: FeedGroup }).group
    expect(group.items.map(i => i.id)).toEqual([1, 2, 3])
    expect(group.author.id).toBe(7)
    expect(group.type).toBe('galgame_status')
  })

  it('keeps a run below the threshold as individual items', () => {
    const rows = foldFeed([status(1, 7), status(2, 7)])
    expect(rows.map(r => r.kind)).toEqual(['item', 'item'])
  })

  it('breaks the run on a different author', () => {
    const rows = foldFeed([status(1, 7), status(2, 7), status(3, 8)])
    expect(rows.map(r => r.kind)).toEqual(['item', 'item', 'item'])
  })

  it('breaks the run on a different status type', () => {
    const rows = foldFeed([
      status(1, 7, 'galgame_status'),
      status(2, 7, 'galgame_status'),
      status(3, 7, 'light_novel_status'),
    ])
    expect(rows.map(r => r.kind)).toEqual(['item', 'item', 'item'])
  })

  it('folds a run of >=3 same-author manga_status into one group', () => {
    const rows = foldFeed([
      status(1, 7, 'manga_status'),
      status(2, 7, 'manga_status'),
      status(3, 7, 'manga_status'),
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]!.kind).toBe('group')
    const group = (rows[0] as { kind: 'group'; group: FeedGroup }).group
    expect(group.items.map(i => i.id)).toEqual([1, 2, 3])
    expect(group.type).toBe('manga_status')
  })

  it('does not fold manga_status into a light_novel_status run', () => {
    const rows = foldFeed([
      status(1, 7, 'light_novel_status'),
      status(2, 7, 'light_novel_status'),
      status(3, 7, 'manga_status'),
    ])
    expect(rows.map(r => r.kind)).toEqual(['item', 'item', 'item'])
  })

  it('does not fold across a non-status item, and folds the trailing run', () => {
    const rows = foldFeed([
      status(1, 7),
      status(2, 7),
      post(3, 7),
      status(4, 7),
      status(5, 7),
      status(6, 7),
    ])
    expect(rows.map(r => r.kind)).toEqual(['item', 'item', 'item', 'group'])
    const group = (rows[3] as { kind: 'group'; group: FeedGroup }).group
    expect(group.items.map(i => i.id)).toEqual([4, 5, 6])
  })

  it('never folds status with a null author', () => {
    const rows = foldFeed([status(1, null), status(2, null), status(3, null)])
    expect(rows.map(r => r.kind)).toEqual(['item', 'item', 'item'])
  })
})

describe('clusterFeed', () => {
  const row = (item: BackendFeedItem): FeedRow => ({ kind: 'item', item })

  it('groups consecutive same-author rows into one cluster', () => {
    const clusters = clusterFeed([row(post(1, 7)), row(post(2, 7)), row(post(3, 7))])
    expect(clusters).toHaveLength(1)
    expect(clusters[0]!.rows).toHaveLength(3)
    expect(clusters[0]!.author?.id).toBe(7)
  })

  it('splits into a new cluster when the author changes', () => {
    const clusters = clusterFeed([row(post(1, 7)), row(post(2, 8)), row(post(3, 8))])
    expect(clusters.map(c => c.rows.length)).toEqual([1, 2])
    expect(clusters.map(c => c.author?.id)).toEqual([7, 8])
  })

  it('keeps a fold group and a following same-author item in one cluster', () => {
    const clusters = clusterFeed(foldFeed([status(1, 7), status(2, 7), status(3, 7), post(4, 7)]))
    expect(clusters).toHaveLength(1)
    expect(clusters[0]!.rows.map(r => r.kind)).toEqual(['group', 'item'])
  })

  it('never clusters null-author rows together', () => {
    const clusters = clusterFeed([row(status(1, null)), row(status(2, null))])
    expect(clusters).toHaveLength(2)
  })
})

describe('feedGroupSummary', () => {
  it('uses the status verb when every item shares a status', () => {
    const rows = foldFeed([status(1, 7), status(2, 7), status(3, 7)])
    const group = (rows[0] as { kind: 'group'; group: FeedGroup }).group
    expect(feedGroupSummary(group)).toBe('通关 3 部作品')
  })

  it('uses the manga status verb for a manga_status group', () => {
    const rows = foldFeed([
      status(1, 7, 'manga_status'),
      status(2, 7, 'manga_status'),
      status(3, 7, 'manga_status'),
    ])
    const group = (rows[0] as { kind: 'group'; group: FeedGroup }).group
    expect(feedGroupSummary(group)).toBe('看完 3 部作品')
  })

  it('falls back to a neutral summary on mixed statuses', () => {
    const rows = foldFeed([
      status(1, 7, 'galgame_status', 'COMPLETED'),
      status(2, 7, 'galgame_status', 'GOING'),
      status(3, 7, 'galgame_status', 'PLAN'),
    ])
    const group = (rows[0] as { kind: 'group'; group: FeedGroup }).group
    expect(feedGroupSummary(group)).toBe('更新了 3 部作品的状态')
  })
})
