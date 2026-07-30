import type { CharacterPageData } from '~~/server/api/pages/characters/[id].get'
import { breadcrumbNode } from './shared'
import { zhText } from '~/utils/seo'

export function characterSeo(data: CharacterPageData) {
  const c = data.character
  const name = c.trans_name || c.name
  const firstG = data.galgames?.items?.[0]
  const firstL = data.light_novels?.items?.[0]
  const work = firstG
    ? firstG.galgame.trans_title || firstG.galgame.origin_title
    : firstL
      ? firstL.light_novel.name_cn || firstL.light_novel.name
      : undefined
  const cv = firstG?.actors?.[0]?.name

  const workText = work ? `「${work}」的` : ''
  const cvText = cv ? `，CV ${cv}` : ''
  const fallbackDesc = `${name} 是${workText}角色${cvText}。在 Hikarinagi 查看角色资料、CV与登场作品`

  const alt = [c.trans_name && c.name !== c.trans_name ? c.name : '', ...(c.aliases ?? [])].filter(
    Boolean,
  )
  const person: Record<string, unknown> = { '@type': 'Person', name }
  if (alt.length) person.alternateName = alt

  return {
    title: work ? `${name} 角色资料・出自「${work}」` : `${name} 角色资料・CV・登场作品`,
    headerTitle: name,
    description: [zhText(c.trans_intro), zhText(c.intro), fallbackDesc],
    schema: [
      person,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name, item: `/characters/${c.id}` },
      ]),
    ],
  }
}
