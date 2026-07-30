import { createError, getRouterParam, type H3Event } from 'h3'
import {
  CATALOG_PAGE_SIZE,
  MANGA_STAFF_CATALOGS,
  type MangaStaffCatalogSlug,
} from '~/features/manga/catalog'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const relation = getRouterParam(event, 'relation') ?? ''
  const catalog = MANGA_STAFF_CATALOGS[relation as MangaStaffCatalogSlug]
  if (!catalog) throw createError({ statusCode: 404 })
  const id = Number(getRouterParam(event, 'id'))

  const [person, works] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/people/{id}/mangas', {
      path: { id },
      query: { role: catalog.role, sort: 'recent', page: 1, page_size: CATALOG_PAGE_SIZE },
    }),
  ])

  const masthead = {
    eyebrow: catalog.eyebrow,
    name: person.trans_name || person.name,
    sub: person.trans_name && person.trans_name !== person.name ? person.name : null,
    image: person.image,
    shape: 'circle' as const,
    meta: [] as string[],
    website: null,
  }

  return { masthead, works, role: catalog.role }
}

export type MangaStaffCatalogPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
