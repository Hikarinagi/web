import { getRouterParam, type H3Event } from 'h3'
import MarkdownIt from 'markdown-it'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

const markdown = new MarkdownIt()

function plainNotes<T extends { note: string }>(items: T[]) {
  return items.map(item => ({
    ...item,
    note: markdown
      .parseInline(item.note.replace(/\s+/g, ' '), {})
      .flatMap(token => token.children ?? [])
      .map(token => (token.type === 'text' || token.type === 'code_inline' ? token.content : ''))
      .join('')
      .trim(),
  }))
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [galgame, producers, my_rate, favorite, my_cover_vote, resources, patches, banners] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } }),
      fetchBackendData(event, '/api/v3/galgames/{id}/producers', { path: { id } }),
      fetchBackendData(event, '/api/v3/galgames/{id}/rate', { path: { id } }).catch(() => null),
      fetchBackendData(event, '/api/v3/user/me/favorite/galgames/{galgame_id}', {
        path: { galgame_id: id },
      }).catch(() => null),
      fetchBackendData(event, '/api/v3/galgames/{id}/covers/vote', { path: { id } }).catch(
        () => null,
      ),
      fetchBackendData(event, '/api/v3/galgames/{id}/downloads', { path: { id } }).catch(
        () => null,
      ),
      fetchBackendData(event, '/api/v3/galgames/{id}/patches', { path: { id } }).catch(() => null),
      fetchBackendData(event, '/api/v3/promotions/banners', {
        query: { surface: 'GALGAME_DOWNLOAD' },
      }).catch(() => []),
    ])

  return {
    galgame,
    producers,
    my_rate,
    favorite,
    my_cover_vote,
    resources,
    patches: patches && {
      web_url: patches.web_url,
      translation: plainNotes(patches.translation),
      other: plainNotes(patches.other),
    },
    banners,
  }
}

export type GalgameDownloadsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}/downloads`,
})
