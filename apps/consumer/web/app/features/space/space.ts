import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { HikariImageSource } from '~/utils/media/image'
import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

export type SpaceRateItem = ApiData<'/api/v3/user/{id}/rates', 'get'>['items'][number]
export type SpaceRatePage = ApiData<'/api/v3/user/{id}/rates', 'get'>
export type SpaceContribution = ApiData<'/api/v3/user/{id}/contributions', 'get'>['items'][number]
export type SpaceContributionPage = ApiData<'/api/v3/user/{id}/contributions', 'get'>
export type SpaceContent = ApiData<'/api/v3/user/{id}/contents', 'get'>['items'][number]
export type SpaceContentPage = ApiData<'/api/v3/user/{id}/contents', 'get'>
export type SpaceFollowPage = ApiData<'/api/v3/user/{id}/following', 'get'>
export type SpaceGalgameFavoritePage = ApiData<'/api/v3/user/{id}/favorite/galgames', 'get'>
export type SpaceLightNovelFavoritePage = ApiData<'/api/v3/user/{id}/favorite/lightnovels', 'get'>
export type SpaceBookshelfPage = ApiData<'/api/v3/reader/me/reading', 'get'>
export type SpaceBookshelfItem = ApiData<'/api/v3/reader/me/reading', 'get'>['items'][number]
export type SpaceReadingStats = ApiData<'/api/v3/reader/me/stats', 'get'>
export type SpaceMangaShelfPage = ApiData<'/api/v3/reader/me/manga/reading', 'get'>
export type SpaceMangaShelfItem = ApiData<'/api/v3/reader/me/manga/reading', 'get'>['items'][number]
export type SpaceMangaReadingStats = ApiData<'/api/v3/reader/me/manga/stats', 'get'>
export type SpaceBookshelfTabData =
  | { shelf: 'novel'; list: SpaceBookshelfPage; stats: SpaceReadingStats }
  | { shelf: 'manga'; list: SpaceMangaShelfPage; stats: SpaceMangaReadingStats }
export type FavoriteCollectionListItem = ApiData<'/api/v3/favorite-collections', 'get'>[number]
export type SpaceCollectionCard = FavoriteCollectionListItem & {
  cover_previews: HikariImageSource[]
}
export type SpaceCollectionItem = ApiData<
  '/api/v3/favorite-collections/{collection_id}/items',
  'get'
>['items'][number]
export type SpaceCollectionItemPage = ApiData<
  '/api/v3/favorite-collections/{collection_id}/items',
  'get'
>
export type SpaceCollectionDetail = ApiData<'/api/v3/favorite-collections/{collection_id}', 'get'>

export const COLLECTION_TYPE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'galgame', label: 'Galgame' },
  { key: 'light_novel', label: '轻小说' },
  { key: 'manga', label: '漫画' },
  { key: 'article', label: '文章' },
  { key: 'post', label: '图文' },
] as const

export type CollectionTypeFilterKey = (typeof COLLECTION_TYPE_FILTERS)[number]['key']
export type ManagedContentPage = ApiData<'/api/v3/user/me/contents', 'get'>
export type ManagedContentItem = ApiData<'/api/v3/user/me/contents', 'get'>['items'][number]

export const SPACE_CONTENT_PAGE_SIZE = 10
export const MANAGED_CONTENT_PAGE_SIZE = 10
export const SPACE_RATE_PAGE_SIZE = 10
export const SPACE_FAVORITE_PAGE_SIZE = 12
export const SPACE_COLLECTION_ITEM_PAGE_SIZE = 24
export const SPACE_CONTRIBUTION_PAGE_SIZE = 12
export const SPACE_FOLLOW_PAGE_SIZE = 12
export const SPACE_BOOKSHELF_PAGE_SIZE = 12

export const MANAGED_STATUS_FILTERS = [
  { key: 'all', label: '全部', severity: undefined },
  { key: 'PUBLISHED', label: '已发布', severity: undefined },
  { key: 'DRAFT', label: '草稿', severity: 'secondary' },
  { key: 'PENDING', label: '审核中', severity: 'warn' },
  { key: 'REJECTED', label: '未通过', severity: 'danger' },
] as const

export type ManagedStatusFilterKey = (typeof MANAGED_STATUS_FILTERS)[number]['key']

export function managedStatusBadge(status: string) {
  return MANAGED_STATUS_FILTERS.find(f => f.key === status)
}

export function managedEditLabel(item: ManagedContentItem): string {
  return item.status === 'DRAFT' ? '继续编辑' : '编辑'
}

export function managedTypeLabel(item: ManagedContentItem): string {
  return item.content_type === 'post' ? '图文' : '文章'
}

export function managedViewPath(item: ManagedContentItem): string {
  return item.content_type === 'post' ? `/posts/${item.id}` : `/articles/${item.id}`
}

export function formatMonthDay(iso: string): string {
  return datePartFormat(iso, TimeFormatEnum.M_D_CN)
}

export const SPACE_TABS = [
  { key: 'feed', label: '动态' },
  { key: 'articles', label: '文章', selfHidden: true },
  { key: 'my-posts', label: '图文', selfOnly: true },
  { key: 'my-articles', label: '文章', selfOnly: true },
  { key: 'rates', label: '状态' },
  { key: 'collections', label: '收藏' },
  { key: 'contributions', label: '贡献' },
  { key: 'follows', label: '关注' },
  { key: 'bookshelf', label: '书架', selfOnly: true },
] as const

export type SpaceTabKey = (typeof SPACE_TABS)[number]['key']

export const BOOKSHELF_SHELVES = [
  { key: 'novel', label: '轻小说' },
  { key: 'manga', label: '漫画' },
] as const

export type BookshelfShelfKey = (typeof BOOKSHELF_SHELVES)[number]['key']

export const BOOKSHELF_STATUS_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'reading', label: '在读' },
  { key: 'finished', label: '读完' },
] as const

export type BookshelfStatusFilterKey = (typeof BOOKSHELF_STATUS_FILTERS)[number]['key']

export function readingTimeHours(ms: number): string {
  const hours = ms / 3_600_000
  if (hours <= 0) return '0'
  return hours < 10 ? hours.toFixed(1) : String(Math.round(hours))
}

// 合并评分板(galgame + 轻小说)按 work_type 派发状态文案——这是个人主页特有的合并视图,
// 各作品域自己的标签表只覆盖单一类型,这里需要按 work_type 选表。
const GALGAME_STATUS: Record<string, string> = {
  PLAN: '想玩',
  GOING: '在玩',
  COMPLETED: '通关',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
}
const LIGHT_NOVEL_STATUS: Record<string, string> = {
  PLAN: '想读',
  GOING: '在读',
  COMPLETED: '读完',
  ON_HOLD: '搁置',
  DROPPED: '弃读',
}
const MANGA_STATUS: Record<string, string> = {
  PLAN: '想看',
  GOING: '在看',
  COMPLETED: '看过',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
}

export function rateStatusLabel(workType: string, status: string | null): string | null {
  if (!status) return null
  const table =
    workType === 'GALGAME'
      ? GALGAME_STATUS
      : workType === 'MANGA'
        ? MANGA_STATUS
        : LIGHT_NOVEL_STATUS
  return table[status] ?? null
}

export { RATE_DIMENSION_LABELS } from '~/features/rate/dimensions'

const NEUTRAL_STATUS: Record<string, string> = {
  PLAN: '想看',
  GOING: '进行中',
  COMPLETED: '已完成',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
}

export const RATE_WORK_FILTERS = [
  { key: 'all', label: '全部', workType: null },
  { key: 'galgame', label: 'Galgame', workType: 'GALGAME' },
  { key: 'light_novel', label: '轻小说', workType: 'LIGHT_NOVEL' },
  { key: 'manga', label: '漫画', workType: 'MANGA' },
] as const

export type RateWorkFilterKey = (typeof RATE_WORK_FILTERS)[number]['key']

export const RATE_STATUS_FILTERS = [
  { key: 'all', status: null },
  { key: 'going', status: 'GOING' },
  { key: 'completed', status: 'COMPLETED' },
  { key: 'plan', status: 'PLAN' },
  { key: 'on_hold', status: 'ON_HOLD' },
  { key: 'dropped', status: 'DROPPED' },
] as const

export type RateStatusFilterKey = (typeof RATE_STATUS_FILTERS)[number]['key']

const RATE_STATUS_FILTER_LABELS: Record<RateWorkFilterKey, Record<string, string>> = {
  all: NEUTRAL_STATUS,
  galgame: GALGAME_STATUS,
  light_novel: LIGHT_NOVEL_STATUS,
  manga: MANGA_STATUS,
}

export function rateStatusFilterLabel(work: RateWorkFilterKey, key: RateStatusFilterKey): string {
  const status = RATE_STATUS_FILTERS.find(f => f.key === key)?.status
  return status ? (RATE_STATUS_FILTER_LABELS[work][status] ?? status) : '全部'
}

export type SpaceRateStatusCounts = ApiData<
  '/api/v3/user/{id}/statistics',
  'get'
>['rate_status_counts']

export function rateStatusBuckets(counts: SpaceRateStatusCounts, work: RateWorkFilterKey) {
  return work === 'all' ? counts : counts.by_work_type[work]
}

function formatRateDate(iso: string): string {
  const year = Number(iso.slice(0, 4))
  const currentYear = new Date().getFullYear()
  return datePartFormat(
    iso,
    year === currentYear ? TimeFormatEnum.M_D_CN : TimeFormatEnum.YYYY_M_D_CN,
  )
}

export function rateDateLine(item: SpaceRateItem): string {
  const date = formatRateDate(item.last_activity_at)
  const label = rateStatusLabel(item.work_type, item.status)
  if (item.status === 'COMPLETED') return `${label}于 ${date}`
  return label ? `${label} · 更新于 ${date}` : `更新于 ${date}`
}

const RESOURCE_LABEL: Record<string, string> = {
  GALGAME: 'Galgame',
  LIGHT_NOVEL: '轻小说',
  LIGHT_NOVEL_VOLUME: '轻小说卷',
  MANGA: '漫画',
  MANGA_VOLUME: '漫画单行本',
  PERSON: '人物',
  CHARACTER: '角色',
  PRODUCER: '厂商',
  TAG: '标签',
}

export function contributionResourceLabel(type: string): string {
  return RESOURCE_LABEL[type] ?? type
}

export function contributionDetailPath(changeRequestId: number | null): string | null {
  return changeRequestId ? `/create/contributions/${changeRequestId}` : null
}

export const CONTRIBUTION_TYPE_FILTERS = [
  { type: 'CHARACTER', label: '角色', countKey: 'edited_character_count' },
  { type: 'GALGAME', label: 'Galgame', countKey: 'edited_galgame_count' },
  { type: 'PERSON', label: '人物', countKey: 'edited_person_count' },
  { type: 'PRODUCER', label: '厂商', countKey: 'edited_producer_count' },
  { type: 'LIGHT_NOVEL', label: '轻小说', countKey: 'edited_light_novel_count' },
  { type: 'LIGHT_NOVEL_VOLUME', label: '分卷', countKey: 'edited_light_novel_volume_count' },
] as const

export function contentPath(content: SpaceContent): string {
  return content.content_type === 'article' ? `/articles/${content.id}` : `/posts/${content.id}`
}
