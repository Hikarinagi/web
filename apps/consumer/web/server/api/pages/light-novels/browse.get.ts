import { getQuery, type H3Event } from 'h3'
import { encodeTagGroup, readBrowseQuery, tagIdsOf } from '~/features/light-novel/explore'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

type SelectedFilterLabel = { id: number; name: string }

async function handler(event: H3Event) {
  const state = readBrowseQuery(getQuery(event))
  const [list, histogram, selected_filter_labels] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels', {
      query: {
        page: state.page,
        page_size: state.page_size,
        sort_field: state.sort_field,
        sort_order: state.sort_order,
        novel_status: state.novel_status,
        readable: state.readable || undefined,
        bunko_id: state.bunko_id,
        years: state.years.length ? state.years : undefined,
        tag_groups: state.tag_groups.length ? state.tag_groups.map(encodeTagGroup) : undefined,
      },
    }),
    fetchBackendData(event, '/api/v3/light-novels/histogram', {}),
    readSelectedFilterLabels(event, state),
  ])

  return { list, histogram, selected_filter_labels, state }
}

async function readSelectedFilterLabels(
  event: H3Event,
  state: ReturnType<typeof readBrowseQuery>,
): Promise<{ tags: SelectedFilterLabel[]; bunko: SelectedFilterLabel | null }> {
  const [tags, bunko] = await Promise.all([
    readEntityLabels(tagIdsOf(state.tag_groups), id =>
      fetchBackendData(event, '/api/v3/tags/{id}', { path: { id } }),
    ),
    state.bunko_id
      ? fetchBackendData(event, '/api/v3/producers/{id}', { path: { id: state.bunko_id } })
          .then(producer => ({ id: producer.id, name: producer.name }))
          .catch(() => null)
      : Promise.resolve<SelectedFilterLabel | null>(null),
  ])

  return { tags, bunko }
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

export type LightNovelsBrowsePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
