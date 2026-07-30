import { getRouterParam, type H3Event } from 'h3'
import { CATALOG_PAGE_SIZE } from '~/features/light-novel/catalog'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [person, works] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/people/{id}/light-novels', {
      path: { id },
      query: { relation: 'illustrator', sort: 'recent', page: 1, page_size: CATALOG_PAGE_SIZE },
    }),
  ])

  const masthead = {
    eyebrow: '插画',
    name: person.trans_name || person.name,
    sub: person.trans_name && person.trans_name !== person.name ? person.name : null,
    image: person.image,
    shape: 'circle' as const,
    meta: [] as string[],
    website: null,
  }

  return { masthead, works }
}

export type IllustratorPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
