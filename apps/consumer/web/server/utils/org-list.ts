import type { H3Event } from 'h3'
import type { ApiQuery } from '@hikarinagi/api-contract/v3'
import { HUB_RECENT, ORG_PAGE_SIZE, type OrgListState } from '~/features/org/results'
import { groupQuery, type OrgMode } from '~/features/org/works'
import { fetchBackendData } from './backend-api'

type WorkQuery = ApiQuery<'/api/v3/producers/{id}/works', 'get'>

const works = (event: H3Event, id: number, query: WorkQuery) =>
  fetchBackendData(event, '/api/v3/producers/{id}/works', { path: { id }, query })

export function fetchOrgList(event: H3Event, id: number, mode: OrgMode, state: OrgListState) {
  const page = { page: state.page, page_size: ORG_PAGE_SIZE }
  if (mode === 'hub')
    return works(event, id, {
      kind: state.media === 'manga' ? 'manga' : 'light_novel',
      released: true,
      sort: 'recent',
      page: 1,
      page_size: HUB_RECENT,
    })
  if (mode === 'serials')
    return works(event, id, {
      kind: 'manga',
      ...(state.status === 'ALL' ? {} : { status: state.status }),
      sort: 'recent',
      ...page,
    })
  return works(event, id, {
    ...groupQuery(state.tab),
    ...(state.year ? { year: state.year } : {}),
    ...(mode === 'shelf' ? { released: true } : {}),
    sort: state.sort === 'old' ? 'oldest' : state.sort === 'rating' ? 'rating' : 'recent',
    ...page,
  })
}

export async function fetchOrgExtras(event: H3Event, id: number, mode: OrgMode) {
  if (mode === 'shelf') {
    const since = new Date()
    since.setMonth(since.getMonth() - 3)
    const recent = await works(event, id, {
      from: since.toISOString().slice(0, 10),
      sort: 'recent',
      page: 1,
      page_size: 100,
    })
    return { recent: recent.items, labels: [], popular: [] }
  }
  if (mode === 'hub') {
    const labels = await fetchBackendData(event, '/api/v3/producers/{id}/labels', { path: { id } })
    return { recent: [], labels, popular: [] }
  }
  if (mode === 'serials') {
    const popular = await works(event, id, { kind: 'manga', sort: 'views', page: 1, page_size: 8 })
    return { recent: [], labels: [], popular: popular.items }
  }
  return { recent: [], labels: [], popular: [] }
}
