import { readPageQuery } from '#shared/utils/query'
import { SPACE_TABS, type SpaceTabKey } from './space'

type PageBffPath = `/api/pages/${string}`

interface SpaceRouteState {
  page: number
  tab: SpaceTabKey
}

const SPACE_TAB_KEYS = SPACE_TABS.map(tab => tab.key) as SpaceTabKey[]

export function readSpaceRouteQuery(query: Record<string, unknown>): SpaceRouteState {
  const tab = query.tab
  const value = Array.isArray(tab) ? tab[0] : tab

  return {
    page: readPageQuery(query),
    tab: SPACE_TAB_KEYS.includes(value as SpaceTabKey) ? (value as SpaceTabKey) : 'feed',
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
  if (state.page > 1) query.set('page', String(state.page))

  const search = query.toString()
  return `${base}${search ? `?${search}` : ''}` as PageBffPath
}
