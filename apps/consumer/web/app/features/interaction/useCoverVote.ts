import type { ApiData, components } from '@hikarinagi/api-contract/v3'

export type CoverVoteWork = 'galgame' | 'light_novel' | 'light_novel_volume'
export type CoverVoteState = ApiData<'/api/v3/galgames/{id}/covers/vote', 'get'>
export type CoverCandidate = components['schemas']['GalgameCoverRelationDto']

const stateKey = (work: CoverVoteWork, id: number) => `${work}:${id}`

function coverVoteStore() {
  return useState<Record<string, CoverVoteState>>('interaction:cover-vote', () => ({}))
}

async function requestVote(
  work: CoverVoteWork,
  id: number,
  mediaId: number,
): Promise<CoverVoteState> {
  if (work === 'galgame') {
    return hikariRequest<'/api/v3/galgames/{id}/covers/vote', 'put'>(
      '/api/v3/galgames/{id}/covers/vote',
      { method: 'put', path: { id }, body: { media_id: mediaId } },
    )
  }
  if (work === 'light_novel') {
    return hikariRequest<'/api/v3/light-novels/{id}/covers/vote', 'put'>(
      '/api/v3/light-novels/{id}/covers/vote',
      { method: 'put', path: { id }, body: { media_id: mediaId } },
    )
  }
  return hikariRequest<'/api/v3/light-novel-volumes/{id}/covers/vote', 'put'>(
    '/api/v3/light-novel-volumes/{id}/covers/vote',
    { method: 'put', path: { id }, body: { media_id: mediaId } },
  )
}

async function requestRetract(work: CoverVoteWork, id: number): Promise<CoverVoteState> {
  if (work === 'galgame') {
    return hikariRequest<'/api/v3/galgames/{id}/covers/vote', 'delete'>(
      '/api/v3/galgames/{id}/covers/vote',
      { method: 'delete', path: { id } },
    )
  }
  if (work === 'light_novel') {
    return hikariRequest<'/api/v3/light-novels/{id}/covers/vote', 'delete'>(
      '/api/v3/light-novels/{id}/covers/vote',
      { method: 'delete', path: { id } },
    )
  }
  return hikariRequest<'/api/v3/light-novel-volumes/{id}/covers/vote', 'delete'>(
    '/api/v3/light-novel-volumes/{id}/covers/vote',
    { method: 'delete', path: { id } },
  )
}

export function useCoverVote(work: CoverVoteWork, workId: number) {
  const overrides = coverVoteStore()
  const busy = ref(false)

  async function vote(mediaId: number) {
    if (busy.value) return
    busy.value = true
    try {
      overrides.value[stateKey(work, workId)] = await requestVote(work, workId, mediaId)
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }

  async function retract() {
    if (busy.value) return
    busy.value = true
    try {
      overrides.value[stateKey(work, workId)] = await requestRetract(work, workId)
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }

  return { vote, retract, busy }
}

export function useCoverVoteView(
  work: CoverVoteWork,
  workId: number,
  fallback: () => CoverVoteState,
) {
  const overrides = coverVoteStore()
  return computed<CoverVoteState>(() => overrides.value[stateKey(work, workId)] ?? fallback())
}

export interface CoverVoteCandidate {
  media: CoverCandidate['media']
  votes: number
  mine: boolean
}

export function toCoverCandidates(
  covers: readonly CoverCandidate[],
  state: CoverVoteState,
): CoverVoteCandidate[] {
  const tally = new Map(state.covers.map(cover => [cover.media_id, cover.votes]))
  return covers
    .map(cover => ({
      media: cover.media,
      votes: tally.get(cover.media.id) ?? cover.votes,
      mine: state.my_media_id === cover.media.id,
    }))
    .sort((a, b) => a.media.id - b.media.id)
}
