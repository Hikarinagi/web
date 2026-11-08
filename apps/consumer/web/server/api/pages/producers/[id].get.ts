import { getQuery, getRouterParam, type H3Event } from 'h3'
import { readOrgQuery } from '~/features/org/results'
import { orgMode } from '~/features/org/works'
import { fetchBackendData } from '../../../utils/backend-api'
import { fetchOrgExtras, fetchOrgList } from '../../../utils/org-list'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = readOrgQuery(getQuery(event))

  const producer = await fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } })
  const [stats, relations, contributors, collaborators, newest] = await Promise.all([
    fetchBackendData(event, '/api/v3/producers/{id}/stats', { path: { id } }),
    fetchBackendData(event, '/api/v3/producers/{id}/relations', { path: { id } }).catch(() => null),
    fetchBackendData(event, '/api/v3/producers/{id}/contributors', { path: { id } }),
    fetchBackendData(event, '/api/v3/producers/{id}/collaborators', { path: { id } }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/producers/{id}/works', {
      path: { id },
      query: { released: true, sort: 'recent', page: 1, page_size: 1 },
    }).catch(() => null),
  ])
  const mode = orgMode(producer.organization_type, stats)
  const novels = stats.groups.some(group => group.kind === 'light_novel')
  const state = { ...query, media: query.media ?? (novels ? 'novel' : 'manga') }
  const [list, extras] = await Promise.all([
    fetchOrgList(event, id, mode, state),
    fetchOrgExtras(event, id, mode),
  ])

  return {
    producer,
    stats,
    relations,
    contributors,
    collaborators,
    newest: newest?.items[0] ?? null,
    mode,
    list,
    extras,
    state,
  }
}

export type ProducerPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/producers/${id}`,
})
