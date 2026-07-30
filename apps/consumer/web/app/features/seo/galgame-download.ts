import type { GalgameDownloadsPageData } from '~~/server/api/pages/galgames/[id]/downloads.get'
import { breadcrumbNode } from './shared'
import { zhText } from '~/utils/seo'

export function galgameDownloadSeo(data: GalgameDownloadsPageData) {
  const g = data.galgame
  const name = g.trans_title || g.origin_title
  const developer = data.producers.find(p => p.role === 'DEVELOPER')?.producer.name
  const fileCount = data.resources.reduce((total, resource) => total + resource.files.length, 0)
  const platforms = [...new Set(data.resources.flatMap(resource => resource.platform))]

  const maker = developer ? `${developer}的` : ''
  const countText = fileCount ? `,共 ${data.resources.length} 个版本 ${fileCount} 个文件` : ''
  const platformText = platforms.length ? `,支持 ${platforms.join('、')} 平台` : ''
  const fallbackDesc = `「${name}」${maker}Galgame 资源下载${countText}${platformText}。在 Hikarinagi 登录后免费获取下载链接,支持直链复制到下载器`

  return {
    title: `「${name}」Galgame 资源下载・免费直链`,
    headerTitle: `${name} 资源下载`,
    description: [zhText(g.trans_intro), fallbackDesc],
    schema: [
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: 'Galgame', item: '/galgames' },
        { name, item: `/galgames/${g.id}` },
        { name: '资源下载', item: `/galgames/${g.id}/downloads` },
      ]),
    ],
  }
}
