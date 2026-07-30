import { fetchBackendData } from '~~/server/utils/backend-api'

const LOC_BUILDERS: Record<string, (id: number) => string> = {
  'galgame-downloads': id => `/galgames/${id}/downloads`,
}

const TYPES = new Set([
  'galgames',
  'galgame-downloads',
  'light-novels',
  'light-novel-volumes',
  'mangas',
  'posts',
  'articles',
  'characters',
  'people',
  'producers',
  'topics',
  'sections',
])

export default defineEventHandler(async event => {
  const type = getRouterParam(event, 'type') ?? ''
  if (!TYPES.has(type)) return []
  const rows = await fetchBackendData(event, '/api/v3/sitemap/{type}', {
    path: { type },
  }).catch(() => [])
  const buildLoc = LOC_BUILDERS[type] ?? ((id: number) => `/${type}/${id}`)
  return (rows ?? []).map(row => ({ loc: buildLoc(row.id), lastmod: row.lastmod }))
})
