import type { H3Event } from 'h3'
import { PERSON_PAGE_SIZE, type PersonListState } from '~/features/person/results'
import { fetchBackendData } from './backend-api'

export async function fetchPersonList(event: H3Event, id: number, state: PersonListState) {
  const query = {
    page: state.page,
    page_size: PERSON_PAGE_SIZE,
    sort: state.order === 'old' ? 'oldest' : 'recent',
  } as const
  if (state.tab === 'VOICE') {
    const voices = await fetchBackendData(event, '/api/v3/people/{id}/characters', {
      path: { id },
      query,
    })
    return { works: null, voices }
  }
  const works = await fetchBackendData(event, '/api/v3/people/{id}/works', {
    path: { id },
    query: state.tab && state.tab !== 'ALL' ? { ...query, code: state.tab } : query,
  })
  return { works, voices: null }
}
