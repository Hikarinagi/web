import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { EntryDefinition } from './editor/draft'
import { codeLabel } from './values'

export type ReferenceGroup = ApiData<'/api/v3/wiki/entries/{id}/references', 'get'>[number]

export interface ReferenceRow {
  key: string
  to: string
  label: string
  sub: string
}

export interface ReferenceSection {
  key: string
  title: string
  total: number
  rows: ReferenceRow[]
}

const TITLES: Record<string, string> = {
  'VOLUME:SERIES': '卷',
  'BOOK:INCLUDED_VOLUME': '收录本卷的出版版本',
  'PRODUCT:INCLUDED_GAME': '发行版本',
  'APPEARANCE:WORK': '出场角色',
  'APPEARANCE:CHARACTER': '出场角色',
  'APPEARANCE:CREDIT': '配音的出场角色',
  'SERIES:CREDIT': '参与创作的系列',
  'BOOK:CREDIT': '参与创作的出版版本',
  'PERSON:MEMBER': '所属团体',
  'ORGANIZATION:MEMBER': '所属组织',
  'ORGANIZATION:PARENT': '下属组织',
}

const OWN_PARTS: Record<string, string[]> = {
  GAME: ['PRODUCT:INCLUDED_GAME', 'APPEARANCE:WORK'],
  SERIES: ['VOLUME:SERIES', 'APPEARANCE:WORK'],
}

const GAME_CREDITS = ['GAME:CREDIT', 'PRODUCT:CREDIT']

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

export function referenceSections(
  groups: ReferenceGroup[],
  type: string,
  definitions: EntryDefinition[],
): ReferenceSection[] {
  const works = new Map<number, ReferenceRow>()
  const sections: ReferenceSection[] = []
  for (const group of groups) {
    const key = `${group.type}:${group.property}`
    if (OWN_PARTS[type]?.includes(key)) continue
    if (GAME_CREDITS.includes(key)) {
      for (const item of group.items) {
        const game = item.owner ?? item.entry
        const role = item.role || (item.code ? codeLabel('CREDIT', item.code) : '')
        const row = works.get(game.id)
        if (!row)
          works.set(game.id, {
            key: `work-${game.id}`,
            to: item.owner
              ? `/entries/${game.id}/edit/releases/${item.entry.id}`
              : `/entries/${game.id}/edit`,
            label: game.label || '未命名',
            sub: role,
          })
        else if (role && !row.sub.split('、').includes(role))
          row.sub = row.sub ? `${row.sub}、${role}` : role
      }
      continue
    }
    sections.push({
      key,
      title: referenceTitle(group, definitions),
      total: group.total,
      rows: group.items.map(item => ({
        key: String(item.statement_id),
        to: `/entries/${item.entry.id}/edit`,
        label: item.entry.label || '未命名',
        sub: (key === 'APPEARANCE:CREDIT' ? item.works : [...item.works, ...item.credits]).join(
          '、',
        ),
      })),
    })
  }
  if (works.size)
    sections.unshift({
      key: 'works',
      title: '参与的作品',
      total: works.size,
      rows: [...works.values()],
    })
  return sections
}
