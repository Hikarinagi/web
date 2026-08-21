import { getQuery, type H3Event } from 'h3'
import { encodeTagGroup, readBrowseQuery, tagIdsOf } from '~/features/galgame/explore'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

type SelectedFilterLabel = { id: number; name: string }

async function handler(event: H3Event) {
  const state = readBrowseQuery(getQuery(event))
  const [list, histogram, selected_filter_labels] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames', {
      query: {
        page: state.page,
        page_size: state.page_size,
        search: state.search,
        sort_field: state.sort_field,
        sort_order: state.sort_order,
        release_from: state.release_from,
        release_to: state.release_to,
        release_periods: state.release_periods.length ? state.release_periods : undefined,
        platforms: state.platforms.length ? state.platforms : undefined,
        origin_lang: state.origin_lang.length ? state.origin_lang : undefined,
        producer_ids: state.producer_ids.length ? state.producer_ids : undefined,
        tag_groups: state.tag_groups.length ? state.tag_groups.map(encodeTagGroup) : undefined,
        staff_person_ids: state.staff_person_ids.length ? state.staff_person_ids : undefined,
        staff_role: state.staff_role,
        include_dev: state.include_dev || undefined,
      },
    }),
    fetchBackendData(event, '/api/v3/galgames/histogram', {}),
    readSelectedFilterLabels(event, state),
  ])

  return { list, histogram, selected_filter_labels, state }
}

async function readSelectedFilterLabels(
  event: H3Event,
  state: ReturnType<typeof readBrowseQuery>,
): Promise<{
  producers: SelectedFilterLabel[]
  tags: SelectedFilterLabel[]
  staff: SelectedFilterLabel[]
}> {
  const [producers, tags, staff] = await Promise.all([
    readEntityLabels(state.producer_ids, id =>
      fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
    ),
    readEntityLabels(tagIdsOf(state.tag_groups), id =>
      fetchBackendData(event, '/api/v3/tags/{id}', { path: { id } }),
    ),
    readEntityLabels(state.staff_person_ids, id =>
      fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    ),
  ])

  return { producers, tags, staff }
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

export type GalgamesBrowsePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
