import { getQuery, type H3Event } from 'h3'
import {
  encodeTagGroup,
  readBrowseQuery,
  tagIdsOf,
  type LightNovelDecade,
} from '~/features/light-novel/explore'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

type SelectedFilterLabel = { id: number; name: string }

const DECADE_RANGE: Record<LightNovelDecade, { from?: string; to?: string }> = {
  '2020s': { from: '2020', to: '2029' },
  '2010s': { from: '2010', to: '2019' },
  '2000s': { from: '2000', to: '2009' },
  earlier: { to: '1999' },
}

async function handler(event: H3Event) {
  const state = readBrowseQuery(getQuery(event))
  const decade = state.decade ? DECADE_RANGE[state.decade] : undefined
  const [list, selected_filter_labels] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels', {
      query: {
        page: state.page,
        page_size: state.page_size,
        search: state.search,
        sort_field: state.sort_field,
        sort_order: state.sort_order,
        novel_status: state.novel_status,
        readable: state.readable || undefined,
        bunko_id: state.bunko_id,
        publication_from: decade?.from,
        publication_to: decade?.to,
        tag_groups: state.tag_groups.length ? state.tag_groups.map(encodeTagGroup) : undefined,
      },
    }),
    readSelectedFilterLabels(event, state),
  ])

  return { list, selected_filter_labels, state }
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
