import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
import { breadcrumbNode, relationCount } from './shared'
import { zhText } from '~/utils/seo'

export function producerSeo(data: ProducerPageData) {
  const p = data.producer
  const name = p.name
  const g = relationCount(data.galgames)
  const l = relationCount(data.light_novels)
  const scope = g && l ? 'Galgame・轻小说' : g ? 'Galgame' : l ? '轻小说' : ''
  const title = scope ? `${name} ${scope} 厂商作品一览` : `${name} 厂商作品一览`

  const works = [g ? `${g} 部 Galgame` : '', l ? `${l} 部轻小说` : ''].filter(Boolean).join('、')
  const countryText = p.country ? `（${p.country}）` : ''
  const worksText = works ? `的作品一览，收录${works}` : '的作品资料'
  const fallbackDesc = `${name}${countryText}${worksText}。在 Hikarinagi 查看厂商资料与全部作品`

  const org: Record<string, unknown> = { '@type': 'Organization', name }
  if (p.aliases?.length) org.alternateName = p.aliases
  if (p.website) org.url = p.website
  if (p.country) org.address = { '@type': 'PostalAddress', addressCountry: p.country }

  return {
    title,
    headerTitle: name,
    description: [zhText(p.trans_intro), zhText(p.intro), fallbackDesc],
    schema: [
      org,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name, item: `/producers/${p.id}` },
      ]),
    ],
  }
}
