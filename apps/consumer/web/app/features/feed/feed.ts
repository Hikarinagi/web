import type { ApiData, ApiQuery } from '@hikarinagi/api-contract/v3'

export const FEED_PAGE_SIZE = 20
export type FeedResponse = ApiData<'/api/v3/feed', 'get'>
export type FeedScope = NonNullable<ApiQuery<'/api/v3/feed', 'get'>['scope']>
// 话题页 feed 排序口径,与后端 FEED_RELATION_SORT 一致(api:contract 再生成后可改从契约派生)
export type TopicFeedSort = 'latest' | 'hot'
export type BackendFeedItem = FeedResponse['items'][number]
export type FeedItemByType<T extends BackendFeedItem['type']> = Extract<
  BackendFeedItem,
  { type: T }
>
export type FeedWorkRef = FeedItemByType<'galgame_rate'>['work_ref']
export type FeedHotComment = NonNullable<FeedItemByType<'post'>['hot_comment']>

export type FeedStatusItem =
  | FeedItemByType<'galgame_status'>
  | FeedItemByType<'light_novel_status'>
  | FeedItemByType<'manga_status'>

export interface FeedGroup {
  type: FeedStatusItem['type']
  author: NonNullable<FeedStatusItem['author']>
  items: FeedStatusItem[]
}

export type FeedRow = { kind: 'item'; item: BackendFeedItem } | { kind: 'group'; group: FeedGroup }

export type FeedAuthor = BackendFeedItem['author']

export interface FeedCluster {
  key: string
  author: FeedAuthor
  rows: FeedRow[]
}

export function feedTypeLabel(item: BackendFeedItem): string {
  switch (item.type) {
    case 'post':
      return item.cover_count > 0 ? '图文' : '短文'
    case 'article':
      return item.is_review ? '长评' : '文章'
    case 'galgame_rate':
    case 'light_novel_rate':
    case 'manga_rate':
      return '评分'
    case 'galgame_status':
    case 'light_novel_status':
    case 'manga_status':
      return '打卡'
    case 'light_novel_volume_rate':
      return '卷评'
  }
}

export function feedItemBlocksNsfw(item: BackendFeedItem): boolean {
  switch (item.type) {
    case 'galgame_rate':
    case 'light_novel_rate':
    case 'manga_rate':
    case 'galgame_status':
    case 'light_novel_status':
    case 'manga_status':
    case 'light_novel_volume_rate':
      return item.work_ref.nsfw
    case 'article':
      return item.is_review && item.review_work?.nsfw === true
    case 'post':
      return false
  }
}

const GALGAME_STATUS_VERB: Record<string, string> = {
  GOING: '在玩',
  COMPLETED: '通关',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
  PLAN: '想玩',
}

const LIGHT_NOVEL_STATUS_VERB: Record<string, string> = {
  GOING: '在看',
  COMPLETED: '看完',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
  PLAN: '想读',
}

const MANGA_STATUS_VERB: Record<string, string> = {
  GOING: '在看',
  COMPLETED: '看完',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
  PLAN: '想看',
}

export function statusVerb(type: BackendFeedItem['type'], status: string): string {
  const map =
    type === 'light_novel_status'
      ? LIGHT_NOVEL_STATUS_VERB
      : type === 'manga_status'
        ? MANGA_STATUS_VERB
        : GALGAME_STATUS_VERB
  return map[status] ?? '更新'
}

export function finishHours(minutes: number): string | null {
  if (!minutes || minutes <= 0) return null
  return `${Math.round(minutes / 60)} 小时`
}

const FOLD_TYPES = ['galgame_status', 'light_novel_status', 'manga_status'] as const
const FOLD_THRESHOLD = 3

function foldable(
  item: BackendFeedItem,
): item is FeedStatusItem & { author: NonNullable<FeedStatusItem['author']> } {
  return (FOLD_TYPES as readonly string[]).includes(item.type) && item.author != null
}

export function foldFeed(items: BackendFeedItem[]): FeedRow[] {
  const rows: FeedRow[] = []
  let i = 0
  while (i < items.length) {
    const head = items[i]!
    if (foldable(head)) {
      let j = i + 1
      while (j < items.length) {
        const next = items[j]!
        if (!foldable(next) || next.type !== head.type || next.author.id !== head.author.id) break
        j++
      }
      if (j - i >= FOLD_THRESHOLD) {
        rows.push({
          kind: 'group',
          group: {
            type: head.type,
            author: head.author,
            items: items.slice(i, j) as FeedStatusItem[],
          },
        })
        i = j
        continue
      }
    }
    rows.push({ kind: 'item', item: head })
    i++
  }
  return rows
}

function rowAuthor(row: FeedRow): FeedAuthor {
  return row.kind === 'group' ? row.group.author : row.item.author
}

export function rowId(row: FeedRow): string {
  return row.kind === 'group'
    ? `group:${row.group.type}:${row.group.items[0]!.id}`
    : `${row.item.type}:${row.item.id}`
}

export function clusterFeed(rows: FeedRow[]): FeedCluster[] {
  const clusters: FeedCluster[] = []
  for (const row of rows) {
    const author = rowAuthor(row)
    const last = clusters[clusters.length - 1]
    if (last && author && author.id != null && last.author?.id === author.id) {
      last.rows.push(row)
    } else {
      clusters.push({ key: `cluster:${rowId(row)}`, author, rows: [row] })
    }
  }
  return clusters
}

export function feedGroupSummary(group: FeedGroup): string {
  const n = group.items.length
  const first = group.items[0]!
  const allSame = group.items.every(item => item.status === first.status)
  if (allSame) return `${statusVerb(group.type, first.status)} ${n} 部作品`
  return `更新了 ${n} 部作品的状态`
}
