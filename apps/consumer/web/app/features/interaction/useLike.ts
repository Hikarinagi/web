type LikeState = { like_count: number; liked: boolean }
export type LikeKind =
  | 'post'
  | 'article'
  | 'galgame_rate'
  | 'light_novel_rate'
  | 'light_novel_volume_rate'
  | 'manga_rate'

const likeKey = (kind: LikeKind, id: number) => `${kind}:${id}`

function likeOverrides() {
  return useState<Record<string, LikeState>>('interaction:like', () => ({}))
}

export function useLike(kind: LikeKind) {
  const overrides = likeOverrides()
  const busy = ref(false)

  async function toggle(id: number, ctx?: { parentId: number; liked: boolean }) {
    if (busy.value) return
    busy.value = true
    try {
      let next: LikeState
      if (kind === 'post') {
        const res = await hikariRequest<'/api/v3/posts/{id}/like', 'post'>(
          '/api/v3/posts/{id}/like',
          { method: 'post', path: { id } },
        )
        next = { like_count: res.like_count, liked: res.liked }
      } else if (kind === 'article') {
        const res = await hikariRequest<'/api/v3/articles/{id}/like', 'post'>(
          '/api/v3/articles/{id}/like',
          { method: 'post', path: { id } },
        )
        next = { like_count: res.like_count, liked: res.liked }
      } else {
        const value = ctx!.liked ? 0 : 1
        let res
        if (kind === 'galgame_rate') {
          res = await hikariRequest<'/api/v3/galgames/{id}/rates/{rateId}/vote', 'post'>(
            '/api/v3/galgames/{id}/rates/{rateId}/vote',
            { method: 'post', path: { id: ctx!.parentId, rateId: id }, body: { value } },
          )
        } else if (kind === 'light_novel_volume_rate') {
          res = await hikariRequest<'/api/v3/light-novel-volumes/{id}/rates/{rateId}/vote', 'post'>(
            '/api/v3/light-novel-volumes/{id}/rates/{rateId}/vote',
            { method: 'post', path: { id: ctx!.parentId, rateId: id }, body: { value } },
          )
        } else if (kind === 'manga_rate') {
          res = await hikariRequest<'/api/v3/mangas/{id}/rates/{rateId}/vote', 'post'>(
            '/api/v3/mangas/{id}/rates/{rateId}/vote',
            { method: 'post', path: { id: ctx!.parentId, rateId: id }, body: { value } },
          )
        } else {
          res = await hikariRequest<'/api/v3/light-novels/{id}/rates/{rateId}/vote', 'post'>(
            '/api/v3/light-novels/{id}/rates/{rateId}/vote',
            { method: 'post', path: { id: ctx!.parentId, rateId: id }, body: { value } },
          )
        }
        next = { like_count: res.like_count, liked: res.my_value === 1 }
      }
      overrides.value[likeKey(kind, id)] = next
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }

  return { toggle, busy }
}

export function useLikeView(kind: LikeKind, id: number, fallback: () => LikeState) {
  const overrides = likeOverrides()
  return computed<LikeState>(() => overrides.value[likeKey(kind, id)] ?? fallback())
}

export function useLikeMutator() {
  const overrides = likeOverrides()
  return (kind: LikeKind, id: number, state: LikeState) => {
    overrides.value[likeKey(kind, id)] = state
  }
}
