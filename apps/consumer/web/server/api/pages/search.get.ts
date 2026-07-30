import { getQuery, type H3Event } from 'h3'
import { readSearchQuery } from '~/features/search/results'
import { SEARCH_TYPES, type SearchType } from '~/features/search/search'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

const WORK_GROUP_SIZE = 12
const ENTITY_GROUP_SIZE = 8

const GROUP_SIZES: Record<SearchType, number> = {
  galgame: WORK_GROUP_SIZE,
  light_novel: WORK_GROUP_SIZE,
  light_novel_volume: WORK_GROUP_SIZE,
  manga: WORK_GROUP_SIZE,
  character: ENTITY_GROUP_SIZE,
  person: ENTITY_GROUP_SIZE,
  producer: ENTITY_GROUP_SIZE,
}

async function handler(event: H3Event) {
  const state = readSearchQuery(getQuery(event))

  if (state.types.length === 1) {
    const list = await fetchBackendData(event, '/api/v3/search', {
      query: { q: state.q, types: state.types, page: state.page, page_size: state.page_size },
    })
    return { mode: 'typed' as const, list, groups: [], total: list.meta.total_items, state }
  }

  if (!state.q) {
    return { mode: 'all' as const, list: null, groups: [], total: 0, state }
  }

  const grouped = await Promise.all(
    SEARCH_TYPES.map(type =>
      fetchBackendData(event, '/api/v3/search', {
        query: { q: state.q, types: [type], page: 1, page_size: GROUP_SIZES[type] },
      }).then(res => ({ type, items: res.items, total: res.meta.total_items })),
    ),
  )
  const groups = grouped.filter(group => group.total > 0)
  const total = groups.reduce((sum, group) => sum + group.total, 0)

  return { mode: 'all' as const, list: null, groups, total, state }
}

export type SearchPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
