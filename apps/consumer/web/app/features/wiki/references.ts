import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { EntryDefinition } from './editor/draft'

export type ReferenceGroup = ApiData<'/api/v3/wiki/entries/{id}/references', 'get'>[number]

const TITLES: Record<string, string> = {
  'VOLUME:SERIES': '卷',
  'BOOK:INCLUDED_VOLUME': '收录本卷的出版版本',
  'PRODUCT:INCLUDED_GAME': '发行版本',
  'APPEARANCE:WORK': '出场角色',
  'APPEARANCE:CHARACTER': '出场角色',
  'APPEARANCE:CREDIT': '配音或出演的角色',
  'GAME:CREDIT': '参与制作的游戏',
  'PRODUCT:CREDIT': '参与制作的发行版本',
  'SERIES:CREDIT': '参与创作的系列',
  'BOOK:CREDIT': '参与创作的出版版本',
  'PERSON:MEMBER': '所属团体',
  'ORGANIZATION:MEMBER': '所属组织',
  'ORGANIZATION:PARENT': '下属组织',
}

export function referenceTitle(
  group: Pick<ReferenceGroup, 'property' | 'type'>,
  definitions: EntryDefinition[],
): string {
  const title = TITLES[`${group.type}:${group.property}`]
  if (title) return title
  const owner = definitions.find(item => item.type === group.type)
  const label = owner?.properties.find(item => item.property === group.property)?.label
  return `${owner?.label ?? ''}的「${label ?? group.property}」`
}
