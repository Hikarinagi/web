import type { ApiData, components } from '@hikarinagi/api-contract/v3'
import { topVotedMedia } from '~/utils/media/image'

export type CoverVoteState = ApiData<'/api/v3/galgames/{id}/covers/vote', 'get'>
export type GalgameCover = components['schemas']['GalgameDetailCoverDto']

function overrides() {
  return useState<Record<number, CoverVoteState>>('galgame:cover-vote', () => ({}))
}

export function useCoverVote(galgameId: number) {
  const state = overrides()
  const busy = ref(false)

  async function send(request: () => Promise<CoverVoteState>) {
    if (busy.value) return
    busy.value = true
    const next = await request()
      .catch(() => null)
      .finally(() => {
        busy.value = false
      })
    if (next) state.value[galgameId] = next
  }

  const vote = (mediaId: number) =>
    send(() =>
      hikariRequest<'/api/v3/galgames/{id}/covers/vote', 'put'>(
        '/api/v3/galgames/{id}/covers/vote',
        { method: 'put', path: { id: galgameId }, body: { media_id: mediaId } },
      ),
    )

  const retract = () =>
    send(() =>
      hikariRequest<'/api/v3/galgames/{id}/covers/vote', 'delete'>(
        '/api/v3/galgames/{id}/covers/vote',
        { method: 'delete', path: { id: galgameId } },
      ),
    )

  return { vote, retract, busy }
}

export function useCoverVoteState(
  galgameId: number,
  covers: () => readonly GalgameCover[],
  mine: () => CoverVoteState | null,
) {
  const state = overrides()
  return computed<CoverVoteState>(
    () =>
      state.value[galgameId] ??
      mine() ?? {
        my_media_id: null,
        shown_media_id: covers()[0]?.media.id ?? null,
        covers: covers().map(cover => ({ media_id: cover.media.id, votes: cover.votes })),
      },
  )
}

export function useGalgameCover(galgame: () => { id: number; covers: GalgameCover[] }) {
  const state = overrides()
  return computed(() => {
    const { id, covers } = galgame()
    const shown = state.value[id]?.shown_media_id
    return covers.find(cover => cover.media.id === shown)?.media ?? topVotedMedia(covers)
  })
}
