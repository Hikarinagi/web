import type { components } from '@hikarinagi/api-contract/v3'
import type { HikariImageMediaSource } from '~/utils/media/image'

export const INLINE_RELATION_CAP = 12
export const RELATION_LIST_PAGE_SIZE = 24

export const ENTITY_FALLBACK_IMAGE = '/images/default-entity.webp'

export type EntityKind = 'person' | 'character' | 'producer'

export const ENTITY_KINDS: readonly string[] = ['person', 'character', 'producer']

export type PersonDetail = components['schemas']['PersonDetailDto']
export type CharacterDetail = components['schemas']['CharacterDetailDto']
export type ProducerDetail = components['schemas']['ProducerDetailDto']
export type EntityDetail = PersonDetail | CharacterDetail | ProducerDetail

export type EntityMedia = components['schemas']['MediaAssetDto']
export type EntityLabel = components['schemas']['EntityLabelDto']
export type EntityContributors = components['schemas']['ContributorsDto']

export interface WorkCardItem {
  to: string
  cover: HikariImageMediaSource | null
  title: string
  year: number | null
  rolePill: string | null
  cvText: string | null
  aspect: 'galgame' | 'light_novel' | 'manga'
  nsfw: boolean
}

export interface VoiceCardItem {
  to: string
  image: EntityMedia | null
  name: string
  sub: string | null
}
