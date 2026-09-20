import { createError, getRouterParam, type H3Event } from 'h3'
import { RELATION_LIST_PAGE_SIZE } from '~/features/entity/entity'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const relation = String(getRouterParam(event, 'relation'))
  const query = { page: 1, page_size: RELATION_LIST_PAGE_SIZE, sort: 'recent' } as const

  const listPromise =
    relation === 'galgames'
      ? fetchBackendData(event, '/api/v3/producers/{id}/galgames', { path: { id }, query })
      : relation === 'light-novels'
        ? fetchBackendData(event, '/api/v3/producers/{id}/light-novels', { path: { id }, query })
        : relation === 'mangas'
          ? fetchBackendData(event, '/api/v3/producers/{id}/mangas', { path: { id }, query })
          : null

  if (!listPromise) throw createError({ statusCode: 404, statusMessage: 'Unknown relation' })

  const [producer, list] = await Promise.all([
    fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
    listPromise,
  ])

  return { producer, relation: list, relation_key: relation }
}

export type ProducerRelationPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: (id, event) => `/producers/${id}/${getRouterParam(event, 'relation')}`,
})
