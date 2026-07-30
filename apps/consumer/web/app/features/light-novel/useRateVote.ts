import type { LightNovelRateListItem } from './rate'
import { useLikeMutator } from '~/features/interaction/useLike'

export function useRateVote(lightNovelId: number) {
  const votingKind = ref<'like' | 'dislike' | null>(null)
  const setLike = useLikeMutator()

  async function vote(rate: LightNovelRateListItem, kind: 'like' | 'dislike') {
    if (votingKind.value) return
    const current = rate.my_value
    const next: -1 | 0 | 1 = kind === 'like' ? (current === 1 ? 0 : 1) : current === -1 ? 0 : -1
    votingKind.value = kind
    try {
      const res = rate.volume
        ? await hikariRequest<'/api/v3/light-novel-volumes/{id}/rates/{rateId}/vote', 'post'>(
            '/api/v3/light-novel-volumes/{id}/rates/{rateId}/vote',
            {
              method: 'post',
              path: { id: rate.volume.id, rateId: rate.id },
              body: { value: next },
            },
          )
        : await hikariRequest<'/api/v3/light-novels/{id}/rates/{rateId}/vote', 'post'>(
            '/api/v3/light-novels/{id}/rates/{rateId}/vote',
            { method: 'post', path: { id: lightNovelId, rateId: rate.id }, body: { value: next } },
          )
      rate.like_count = res.like_count
      rate.my_value = res.my_value
      setLike(rate.volume ? 'light_novel_volume_rate' : 'light_novel_rate', rate.id, {
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
