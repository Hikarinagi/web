import { getQuery, type H3Event } from 'h3'
import { encodeTagGroup, readBrowseQuery, tagIdsOf } from '~/features/manga/explore'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

type SelectedFilterLabel = { id: number; name: string }
type GenreLabel = { key: string; name: string }

async function handler(event: H3Event) {
  const state = readBrowseQuery(getQuery(event))
  const [list, selected_filter_labels] = await Promise.all([
    fetchBackendData(event, '/api/v3/mangas', {
      query: {
        page: state.page,
        page_size: state.page_size,
        search: state.search,
        sort_field: state.sort_field,
        sort_order: state.sort_order,
        region: state.region,
        audience: state.audience,
        serial_status: state.serial_status,
        decade: state.decade,
        magazine_id: state.magazine_id,
        tag: state.tag,
        tag_groups: state.tag_groups.length ? state.tag_groups.map(encodeTagGroup) : undefined,
        genre: state.genre.length ? state.genre : undefined,
      },
    }),
    readSelectedFilterLabels(event, state),
  ])

  return { list, selected_filter_labels, state }
}

async function readSelectedFilterLabels(
  event: H3Event,
  state: ReturnType<typeof readBrowseQuery>,
): Promise<{
  tags: SelectedFilterLabel[]
  magazine: SelectedFilterLabel | null
  genres: GenreLabel[]
}> {
  const [tags, magazine, genres] = await Promise.all([
    readEntityLabels(tagIdsOf(state.tag_groups), id =>
      fetchBackendData(event, '/api/v3/tags/{id}', { path: { id } }),
    ),
    state.magazine_id
      ? fetchBackendData(event, '/api/v3/producers/{id}', { path: { id: state.magazine_id } })
          .then(producer => ({ id: producer.id, name: producer.name }))
          .catch(() => null)
      : Promise.resolve<SelectedFilterLabel | null>(null),
    readGenreLabels(event, state.genre),
  ])

  return { tags, magazine, genres }
}

async function readGenreLabels(event: H3Event, keys: string[]): Promise<GenreLabel[]> {
  if (!keys.length) return []
  const catalog = await fetchBackendData(event, '/api/v3/mangas/genres').catch(() => [])
  return keys.flatMap(key => {
    const genre = catalog.find(item => item.key === key)
    return genre ? [{ key: genre.key, name: genre.name }] : []
  })
}

async function readEntityLabels(
  ids: number[],
  fetcher: (id: number) => Promise<{ id: number; name: string }>,
): Promise<SelectedFilterLabel[]> {
  const rows = await Promise.all(
    [...new Set(ids)]
      .filter(id => Number.isInteger(id) && id > 0)
      .slice(0, 50)
      .map(id =>
        fetcher(id)
          .then(entity => ({ id: entity.id, name: entity.name }))
          .catch(() => null),
      ),
  )

  return rows.filter((row): row is SelectedFilterLabel => !!row)
}

export type MangasBrowsePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
