import { createError, getRouterParam, type H3Event } from 'h3'
import { RELATION_LIST_PAGE_SIZE } from '~/features/entity/entity'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'
import { readPage } from '../../../../utils/page-query'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const relation = String(getRouterParam(event, 'relation'))
  const query = {
    page: readPage(event),
    page_size: RELATION_LIST_PAGE_SIZE,
    sort: 'recent',
  } as const

  const listPromise =
    relation === 'galgames'
      ? fetchBackendData(event, '/api/v3/people/{id}/galgames', { path: { id }, query })
      : relation === 'light-novels'
        ? fetchBackendData(event, '/api/v3/people/{id}/light-novels', { path: { id }, query })
        : relation === 'mangas'
          ? fetchBackendData(event, '/api/v3/people/{id}/mangas', { path: { id }, query })
          : relation === 'characters'
            ? fetchBackendData(event, '/api/v3/people/{id}/characters', { path: { id }, query })
            : null

  if (!listPromise) throw createError({ statusCode: 404, statusMessage: 'Unknown relation' })

  const [person, list] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    listPromise,
  ])

  return { person, relation: list, relation_key: relation }
}

export type PeopleRelationPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: (id, event) => `/people/${id}/${getRouterParam(event, 'relation')}`,
})
