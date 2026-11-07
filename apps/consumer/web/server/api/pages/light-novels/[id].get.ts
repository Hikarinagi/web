import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [
    light_novel,
    volumes,
    tags,
    people,
    producers,
    characters,
    relations,
    rate_stats,
    top_rates,
    articles,
    contributors,
    my_rate,
    favorite,
    progress,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/tags', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/people', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/producers', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/characters', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/relations', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates/statistics', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates', {
      path: { id },
      query: { page: 1, page_size: 12, sort: 'hot', has_content: true },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/articles', {
      path: { id },
      query: { page: 1, page_size: 6 },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/contributors', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rate', { path: { id } }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/favorite/lightnovels/{light_novel_id}', {
      path: { light_novel_id: id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/reader/light-novels/{light_novel_id}/progress', {
      path: { light_novel_id: id },
    }).catch(() => null),
  ])

  const worksOf = (relation: 'author' | 'illustrator') => {
    const person = people.find(item => item.relation === relation)?.person
    if (!person) return null
    return fetchBackendData(event, '/api/v3/people/{id}/light-novels', {
      path: { id: person.id },
      query: { page: 1, page_size: 6, sort: 'recent', relation },
    }).catch(() => null)
  }
  const [author_works, illustrator_works] = await Promise.all([
    worksOf('author'),
    worksOf('illustrator'),
  ])

  return {
    light_novel,
    volumes,
    tags,
    people,
    producers,
    characters,
    relations,
    rate_stats,
    top_rates,
    articles,
    contributors,
    my_rate,
    favorite,
    progress,
    author_works,
    illustrator_works,
  }
}

export type LightNovelPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novels/${id}`,
})
