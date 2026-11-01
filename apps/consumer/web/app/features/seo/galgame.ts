import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
import { breadcrumbNode, ratingNode } from './shared'
import { zhText } from '~/utils/seo'

function creditName(data: GalgamePageData, roles: string[]) {
  for (const role of roles) {
    const hit = data.credits.groups.find(group => group.code === role)?.credits[0]
    if (hit) return hit.text
  }
  return undefined
}

export function galgameSeo(data: GalgamePageData) {
  const g = data.galgame
  const name = g.trans_title || g.origin_title
  const developer = creditName(data, ['DEVELOPER', 'PUBLISHER'])
  const platform = g.platforms[0]
  const year = g.release_date ? new Date(g.release_date).getFullYear() : undefined

  const hasDownload = g.download_resource_count > 0
  const maker = developer ? `${developer}制作的` : ''
  const plat = platform ? `${platform}平台` : ''
  const prefix = `${maker}${plat}`
  const head = prefix ? `「${name}」是${prefix}Galgame` : `「${name}」是一款 Galgame`
  const releaseText = year ? `，${year} 年发售` : ''
  const downloadText = hasDownload ? '，提供资源下载' : ''
  const fallbackDesc = `${head}${releaseText}。在 Hikarinagi 查看游戏介绍、角色CV、Staff 和玩家评分${downloadText}`

  const videoGame: Record<string, unknown> = { '@type': 'VideoGame', name }
  if (g.trans_title && g.trans_title !== g.origin_title) videoGame.alternateName = g.origin_title
  if (g.origin_lang) videoGame.inLanguage = g.origin_lang
  if (g.release_date) videoGame.datePublished = g.release_date.slice(0, 10)
  if (g.platforms.length) videoGame.gamePlatform = g.platforms
  const publisher = creditName(data, ['PUBLISHER', 'DEVELOPER'])
  if (publisher) videoGame.publisher = { '@type': 'Organization', name: publisher }
  const rating = ratingNode(data.rate_stats)
  if (rating) videoGame.aggregateRating = rating

  return {
    title: `「${name}」${developer ? `${developer} ` : ''}Galgame 角色・CV・评分${hasDownload ? '・资源下载' : ''}`,
    headerTitle: name,
    description: [zhText(g.trans_intro), zhText(g.origin_intro), fallbackDesc],
    schema: [
      videoGame,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: 'Galgame', item: '/galgames' },
        { name, item: `/galgames/${g.id}` },
      ]),
    ],
  }
}
