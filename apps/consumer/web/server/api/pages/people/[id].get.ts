import { getQuery, type H3Event } from 'h3'
import { defaultPersonTab, readPersonQuery } from '~/features/person/results'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { readId } from '../../../utils/page-query'
import { fetchPersonList } from '../../../utils/person-list'

async function handler(event: H3Event) {
  const id = readId(event)
  const query = readPersonQuery(getQuery(event))
  const known = { page: 1, page_size: 4, sort: 'popular' } as const

  const person = await fetchBackendData(event, '/api/v3/people/{id}', { path: { id } })
  const [stats, contributors, works, voices] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}/stats', { path: { id } }),
    fetchBackendData(event, '/api/v3/people/{id}/contributors', { path: { id } }),
    fetchBackendData(event, '/api/v3/people/{id}/works', { path: { id }, query: known }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/people/{id}/characters', {
      path: { id },
      query: known,
    }).catch(() => null),
  ])
  const state = { ...query, tab: query.tab ?? defaultPersonTab(stats) }
  const list = await fetchPersonList(event, id, state)

  return {
    person,
    stats,
    contributors,
    known: { works: works?.items ?? [], voices: voices?.items ?? [] },
    list,
    state,
  }
}

export type PeoplePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/people/${id}`,
})
