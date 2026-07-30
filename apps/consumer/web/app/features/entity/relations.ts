import type { components } from '@hikarinagi/api-contract/v3'
import { topVotedMedia } from '~/utils/media/image'
import type { EntityKind, VoiceCardItem, WorkCardItem } from './entity'
import { personLnRelationLabel, producerLnRelationLabel, workYear } from './labels'
import { staffRoleLabel } from '~/features/galgame/labels'
import { mangaProducerRoleLabel, mangaStaffRoleLabel } from '~/features/manga/labels'
import { characterRoleLabel } from '~/labels/work'

type GalgameSummary = components['schemas']['GalgameSummaryDto']
type LightNovelSummary = components['schemas']['LightNovelSummaryDto']
type MangaSummary = components['schemas']['MangaSummaryDto']
type PersonGalgameRel = components['schemas']['PersonGalgameRelationDto']
type CharacterGalgameRel = components['schemas']['CharacterGalgameRelationDto']
type ProducerGalgameRel = components['schemas']['ProducerGalgameRelationDto']
type PersonLnRel = components['schemas']['PersonLightNovelRelationDto']
type CharacterLnRel = components['schemas']['CharacterLightNovelRelationDto']
type ProducerLnRel = components['schemas']['ProducerLightNovelRelationDto']
type PersonCharacterRel = components['schemas']['PersonCharacterRelationDto']

export interface PersonMangaRelationItem {
  roles: components['schemas']['MangaStaffRole'][]
  manga: MangaSummary
}

export interface CharacterMangaRelationItem {
  role: components['schemas']['CharacterRole']
  manga: MangaSummary
}

export interface ProducerMangaRelationItem {
  role: components['schemas']['MangaProducerRole']
  note: string
  manga: MangaSummary
}

export type WorkVariant =
  | 'person-galgame'
  | 'character-galgame'
  | 'producer-galgame'
  | 'person-light-novel'
  | 'character-light-novel'
  | 'producer-light-novel'
  | 'person-manga'
  | 'character-manga'
  | 'producer-manga'

function galgameCard(
  galgame: GalgameSummary,
  rolePill: string | null,
  cvText: string | null,
): WorkCardItem {
  return {
    to: `/galgames/${galgame.id}`,
    cover: topVotedMedia(galgame.covers),
    title: galgame.trans_title || galgame.origin_title,
    year: workYear(galgame.release_date),
    rolePill,
    cvText,
    aspect: 'galgame',
    nsfw: galgame.nsfw,
  }
}

function lightNovelCard(lightNovel: LightNovelSummary, rolePill: string | null): WorkCardItem {
  return {
    to: `/light-novels/${lightNovel.id}`,
    cover: topVotedMedia(lightNovel.covers),
    title: lightNovel.name_cn || lightNovel.name,
    year: workYear(lightNovel.publication_date),
    rolePill,
    cvText: null,
    aspect: 'light_novel',
    nsfw: lightNovel.nsfw,
  }
}

function mangaCard(manga: MangaSummary, rolePill: string | null): WorkCardItem {
  return {
    to: `/mangas/${manga.id}`,
    cover: topVotedMedia(manga.covers),
    title: manga.name_cn || manga.name,
    year: workYear(manga.publication_date),
    rolePill,
    cvText: null,
    aspect: 'manga',
    nsfw: manga.nsfw,
  }
}

function cvText(actors: { name: string; trans_name: string | null }[]): string | null {
  if (!actors.length) return null
  return `CV ${actors.map(actor => actor.trans_name || actor.name).join(' / ')}`
}

export function mapWorkItems(items: readonly unknown[], variant: WorkVariant): WorkCardItem[] {
  switch (variant) {
    case 'person-galgame':
      return (items as PersonGalgameRel[]).map(item =>
        galgameCard(
          item.galgame,
          item.roles.length ? item.roles.map(staffRoleLabel).join(' / ') : null,
          null,
        ),
      )
    case 'character-galgame':
      return (items as CharacterGalgameRel[]).map(item =>
        galgameCard(item.galgame, characterRoleLabel(item.role), cvText(item.actors)),
      )
    case 'producer-galgame':
      return (items as ProducerGalgameRel[]).map(item => galgameCard(item.galgame, null, null))
    case 'person-light-novel':
      return (items as PersonLnRel[]).map(item =>
        lightNovelCard(item.light_novel, personLnRelationLabel(item.relation)),
      )
    case 'character-light-novel':
      return (items as CharacterLnRel[]).map(item =>
        lightNovelCard(item.light_novel, characterRoleLabel(item.role)),
      )
    case 'producer-light-novel':
      return (items as ProducerLnRel[]).map(item =>
        lightNovelCard(item.light_novel, producerLnRelationLabel(item.relation)),
      )
    case 'person-manga':
      return (items as PersonMangaRelationItem[]).map(item =>
        mangaCard(
          item.manga,
          item.roles.length ? item.roles.map(mangaStaffRoleLabel).join(' / ') : null,
        ),
      )
    case 'character-manga':
      return (items as CharacterMangaRelationItem[]).map(item =>
        mangaCard(item.manga, characterRoleLabel(item.role)),
      )
    case 'producer-manga':
      return (items as ProducerMangaRelationItem[]).map(item =>
        mangaCard(item.manga, mangaProducerRoleLabel(item.role)),
      )
  }
}

export function mapVoiceItems(items: readonly unknown[]): VoiceCardItem[] {
  return (items as PersonCharacterRel[]).map(item => {
    const titles = item.galgames.map(galgame => galgame.trans_title || galgame.origin_title)
    const preview = titles.slice(0, 2).join(' / ')
    return {
      to: `/characters/${item.character.id}`,
      image: item.character.image ?? null,
      name: item.character.trans_name || item.character.name,
      sub:
        titles.length === 1
          ? `出自 ${preview}`
          : titles.length > 1
            ? `出演 ${titles.length} 部作品 · ${preview}${titles.length > 2 ? ' 等' : ''}`
            : null,
    }
  })
}

export type RelationMode = 'work' | 'voice'

export interface RelationConfig {
  title: string
  mode: RelationMode
  variant?: WorkVariant
  unit?: string
}

export const ENTITY_RELATION_CONFIG: Record<EntityKind, Record<string, RelationConfig>> = {
  person: {
    galgames: { title: '参与作品', mode: 'work', variant: 'person-galgame', unit: 'Galgame' },
    'light-novels': { title: '参与的轻小说', mode: 'work', variant: 'person-light-novel' },
    mangas: { title: '参与的漫画', mode: 'work', variant: 'person-manga' },
    characters: { title: '配音角色', mode: 'voice' },
  },
  character: {
    galgames: { title: '出场作品', mode: 'work', variant: 'character-galgame', unit: 'Galgame' },
    'light-novels': { title: '出演的轻小说', mode: 'work', variant: 'character-light-novel' },
    mangas: { title: '出场的漫画', mode: 'work', variant: 'character-manga' },
  },
  producer: {
    galgames: { title: '相关作品', mode: 'work', variant: 'producer-galgame', unit: 'Galgame' },
    'light-novels': { title: '出版作品', mode: 'work', variant: 'producer-light-novel' },
    mangas: { title: '漫画作品', mode: 'work', variant: 'producer-manga' },
  },
}
