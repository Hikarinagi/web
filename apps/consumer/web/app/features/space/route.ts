import { readPageQuery } from '#shared/utils/query'
import {
  RATE_STATUS_FILTERS,
  RATE_WORK_FILTERS,
  SPACE_TABS,
  type BookshelfShelfKey,
  type RateStatusFilterKey,
  type RateWorkFilterKey,
  type SpaceTabKey,
} from './space'

type PageBffPath = `/api/pages/${string}`

interface SpaceRouteState {
  page: number
  tab: SpaceTabKey
  shelf: BookshelfShelfKey
  work: RateWorkFilterKey
  status: RateStatusFilterKey
}

const SPACE_TAB_KEYS = SPACE_TABS.map(tab => tab.key) as SpaceTabKey[]
const RATE_WORK_KEYS = RATE_WORK_FILTERS.map(f => f.key) as RateWorkFilterKey[]
const RATE_STATUS_KEYS = RATE_STATUS_FILTERS.map(f => f.key) as RateStatusFilterKey[]

function readSingle(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : undefined
}

export function readSpaceRouteQuery(query: Record<string, unknown>): SpaceRouteState {
  const value = readSingle(query.tab)
  const shelfValue = readSingle(query.shelf)
  const workValue = readSingle(query.work)
  const statusValue = readSingle(query.status)

  return {
    page: readPageQuery(query),
    tab: SPACE_TAB_KEYS.includes(value as SpaceTabKey) ? (value as SpaceTabKey) : 'feed',
    shelf: shelfValue === 'manga' ? 'manga' : 'novel',
    work: RATE_WORK_KEYS.includes(workValue as RateWorkFilterKey)
      ? (workValue as RateWorkFilterKey)
      : 'all',
    status: RATE_STATUS_KEYS.includes(statusValue as RateStatusFilterKey)
      ? (statusValue as RateStatusFilterKey)
      : 'all',
  }
}

export function spacePageBffPath(userId: number, state: SpaceRouteState): PageBffPath {
  return buildSpaceBffPath(`/api/pages/space/${userId}`, state)
}

export function spaceTabBffPath(userId: number, state: SpaceRouteState): PageBffPath {
  return buildSpaceBffPath(`/api/pages/space/${userId}/tab`, state)
}

function buildSpaceBffPath(base: string, state: SpaceRouteState): PageBffPath {
  const query = new URLSearchParams()
  if (state.tab !== 'feed') query.set('tab', state.tab)
  if (state.tab === 'bookshelf' && state.shelf === 'manga') query.set('shelf', state.shelf)
  if (state.tab === 'rates' && state.work !== 'all') query.set('work', state.work)
  if (state.tab === 'rates' && state.status !== 'all') query.set('status', state.status)
  if (state.tab !== 'feed' && state.page > 1) query.set('page', String(state.page))

  const search = query.toString()
  return `${base}${search ? `?${search}` : ''}` as PageBffPath
}
