import type { GalgameRateListItem } from './rate'
import { useLikeMutator } from '~/features/interaction/useLike'

export function useRateVote(galgameId: number) {
  const votingKind = ref<'like' | 'dislike' | null>(null)
  const setLike = useLikeMutator()

  async function vote(rate: GalgameRateListItem, kind: 'like' | 'dislike') {
    if (votingKind.value) return
    const current = rate.my_value
    const next: -1 | 0 | 1 = kind === 'like' ? (current === 1 ? 0 : 1) : current === -1 ? 0 : -1
    votingKind.value = kind
    try {
      const res = await hikariRequest<'/api/v3/galgames/{id}/rates/{rateId}/vote', 'post'>(
        '/api/v3/galgames/{id}/rates/{rateId}/vote',
        { method: 'post', path: { id: galgameId, rateId: rate.id }, body: { value: next } },
      )
      rate.like_count = res.like_count
      rate.dislike_count = res.dislike_count
      rate.my_value = res.my_value
      setLike('galgame_rate', rate.id, {
        like_count: res.like_count,
        liked: res.my_value === 1,
      })
    } catch {
      /* empty */
    } finally {
      votingKind.value = null
    }
  }

  return { vote, votingKind }
}
