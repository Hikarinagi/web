import { getRouterParam, type H3Event } from 'h3'
import { CATALOG_PAGE_SIZE } from '~/features/light-novel/catalog'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [producer, works] = await Promise.all([
    fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/producers/{id}/light-novels', {
      path: { id },
      query: { relation: 'bunko', sort: 'recent', page: 1, page_size: CATALOG_PAGE_SIZE },
    }),
  ])

  const masthead = {
    eyebrow: '文库',
    name: producer.name,
    sub: producer.aliases.length ? producer.aliases.join(' / ') : null,
    image: producer.logo,
    shape: 'square' as const,
    meta: [producer.country, producer.established ? `成立于 ${producer.established}` : null].filter(
      (v): v is string => Boolean(v),
    ),
    website: producer.website,
  }

  return { masthead, works }
}

export type BunkoPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
