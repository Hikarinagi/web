import {
  pushRecent,
  takeRecommended,
  visitorId,
  type RecommendKind,
} from '~/features/recommend/session'

export type ViewPingKind =
  'galgame' | 'light_novel' | 'light_novel_volume' | 'manga' | 'manga_volume' | 'post' | 'article'

function workView(kind: RecommendKind, id: number) {
  const body = { visitor: visitorId(), from_recommend: takeRecommended(kind, id) }
  pushRecent(kind, id)
  return body
}

export function useViewPing(kind: ViewPingKind, id: number) {
  onMounted(() => {
    if (!Number.isInteger(id) || id <= 0) return
    void ping(kind, id)
  })
}

async function ping(kind: ViewPingKind, id: number) {
  try {
    switch (kind) {
      case 'galgame':
        await hikariRequest<'/api/v3/galgames/{id}/views', 'post'>('/api/v3/galgames/{id}/views', {
          method: 'post',
          path: { id },
          body: workView(kind, id),
          toast: false,
        })
        break
      case 'light_novel':
        await hikariRequest<'/api/v3/light-novels/{id}/views', 'post'>(
          '/api/v3/light-novels/{id}/views',
          { method: 'post', path: { id }, body: workView(kind, id), toast: false },
        )
        break
      case 'light_novel_volume':
        await hikariRequest<'/api/v3/light-novel-volumes/{id}/views', 'post'>(
          '/api/v3/light-novel-volumes/{id}/views',
          { method: 'post', path: { id }, toast: false },
        )
        break
      case 'manga':
        await hikariRequest<'/api/v3/mangas/{id}/views', 'post'>('/api/v3/mangas/{id}/views', {
          method: 'post',
          path: { id },
          body: workView(kind, id),
          toast: false,
        })
        break
      case 'manga_volume':
        await hikariRequest<'/api/v3/manga-volumes/{id}/views', 'post'>(
          '/api/v3/manga-volumes/{id}/views',
          { method: 'post', path: { id }, toast: false },
        )
        break
      case 'post':
        await hikariRequest<'/api/v3/posts/{id}/views', 'post'>('/api/v3/posts/{id}/views', {
          method: 'post',
          path: { id },
          toast: false,
        })
        break
      case 'article':
        await hikariRequest<'/api/v3/articles/{id}/views', 'post'>('/api/v3/articles/{id}/views', {
          method: 'post',
          path: { id },
          toast: false,
        })
        break
    }
  } catch {
    /* empty */
  }
}
