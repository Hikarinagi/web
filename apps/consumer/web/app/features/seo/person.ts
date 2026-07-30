import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
import { breadcrumbNode, relationCount } from './shared'
import { zhText } from '~/utils/seo'

export function personSeo(data: PeoplePageData) {
  const p = data.person
  const name = p.trans_name || p.name
  const gWorks = relationCount(data.galgames)
  const cvChars = relationCount(data.characters)
  const l = relationCount(data.light_novels)
  const hasG = gWorks > 0 || cvChars > 0
  const scope = hasG && l ? 'Galgame・轻小说' : hasG ? 'Galgame' : l ? '轻小说' : ''
  const title = scope ? `${name} 参与的 ${scope} 一览` : `${name} 作品一览`

  const works = [
    gWorks ? `${gWorks} 部 Galgame` : cvChars ? `${cvChars} 个配音角色` : '',
    l ? `${l} 部轻小说` : '',
  ]
    .filter(Boolean)
    .join('、')
  const worksText = works ? `，参与的${works}` : ''
  const fallbackDesc = `${name}${worksText}。在 Hikarinagi 查看个人资料、配音角色与全部参与作品`

  const alt = [p.trans_name && p.name !== p.trans_name ? p.name : '', ...(p.aliases ?? [])].filter(
    Boolean,
  )
  const person: Record<string, unknown> = { '@type': 'Person', name }
  if (alt.length) person.alternateName = alt

  return {
    title,
    headerTitle: name,
    description: [zhText(p.trans_intro), zhText(p.intro), fallbackDesc],
    schema: [
      person,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name, item: `/people/${p.id}` },
      ]),
    ],
  }
}
