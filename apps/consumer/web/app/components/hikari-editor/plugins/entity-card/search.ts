import type { components } from '@hikarinagi/api-contract/v3'
import type {
  ArticleCardSummary,
  CharacterCardSummary,
  GalgameCardSummary,
  GalgameRateCardSummary,
  LightNovelCardSummary,
  LightNovelRateCardSummary,
  LightNovelVolumeCardSummary,
  MangaCardSummary,
  MangaRateCardSummary,
  PersonCardSummary,
  PostCardSummary,
  ProducerCardSummary,
} from '~/components/hikari-content/composables/useContentSummaries'
import { topVotedMedia, type HikariImageSource } from '~/utils/media/image'
import { displayName } from '~/utils/user'
import type { EntityCardType } from './types'

type Schemas = components['schemas']

export const SEARCH_PAGE_SIZE = 6

interface PickedDisplay {
  title: string
  subtitle: string | null
  cover: HikariImageSource
  meta: string | null
  nsfw: boolean
}

// Discriminated union by `kind`:让 EntityCardSearch 的 insertItem 可以 switch + exhaustive
// 收窄到 typed summary,不再需要 `as never` cast 抹平类型。
interface PickedEntityShape<K extends EntityCardType, S> {
  kind: K
  entity_id: number
  display: PickedDisplay
  summary: S
}

export type PickedEntity =
  | PickedEntityShape<'galgame', GalgameCardSummary>
  | PickedEntityShape<'light_novel', LightNovelCardSummary>
  | PickedEntityShape<'light_novel_volume', LightNovelVolumeCardSummary>
  | PickedEntityShape<'manga', MangaCardSummary>
  | PickedEntityShape<'person', PersonCardSummary>
  | PickedEntityShape<'producer', ProducerCardSummary>
  | PickedEntityShape<'character', CharacterCardSummary>
  | PickedEntityShape<'article', ArticleCardSummary>
  | PickedEntityShape<'post', PostCardSummary>
  | PickedEntityShape<'galgame_rate', GalgameRateCardSummary>
  | PickedEntityShape<'light_novel_rate', LightNovelRateCardSummary>
  | PickedEntityShape<'manga_rate', MangaRateCardSummary>

function yearOf(date: string | null | undefined): string | null {
  if (!date) return null
  const y = new Date(date).getFullYear()
  return Number.isFinite(y) ? String(y) : null
}

function topCover(
  covers: Array<{ media: Schemas['MediaAssetDto'] }> | undefined,
): Schemas['MediaAssetDto'] | null {
  return covers?.[0]?.media ?? null
}

function topWorkCover(
  covers: Array<{ votes?: number | null; media: Schemas['RatedMediaAssetDto'] }> | undefined,
) {
  return topVotedMedia(covers)
}

function joinMeta(parts: Array<string | null | undefined>): string | null {
  const cleaned = parts.filter((p): p is string => typeof p === 'string' && p.length > 0)
  return cleaned.length > 0 ? cleaned.join(' · ') : null
}

type PickedFor<K extends PickedEntity['kind']> = Extract<PickedEntity, { kind: K }>

function galgameMap(raw: Schemas['GalgameSummaryDto']): PickedFor<'galgame'> {
  const origin = raw.origin_title ?? null
  const title = raw.trans_title || origin || '未命名'
  const subtitle = raw.trans_title && origin && origin !== title ? origin : null
  const topProducerName = raw.producers?.[0]?.producer?.name ?? null
  const cover = topWorkCover(raw.covers)
  const summary: GalgameCardSummary = {
    id: raw.id,
    origin_title: raw.origin_title ?? '',
    trans_title: raw.trans_title ?? null,
    start_date: raw.start_date ?? null,
    nsfw: raw.nsfw,
    top_cover: cover,
    top_producer_name: topProducerName,
  }
  return {
    kind: 'galgame',
    entity_id: raw.id,
    display: {
      title,
      subtitle,
      cover,
      meta: joinMeta(['Galgame', yearOf(raw.start_date as string | null), topProducerName]),
      nsfw: raw.nsfw,
    },
    summary,
  }
}

function lightNovelMap(raw: Schemas['LightNovelSummaryDto']): PickedFor<'light_novel'> {
  const title = raw.name_cn || raw.name
  const subtitle = raw.name_cn ? raw.name : null
  const cover = topWorkCover(raw.covers)
  const summary: LightNovelCardSummary = {
    id: raw.id,
    name: raw.name,
    name_cn: raw.name_cn ?? null,
    publication_date: raw.publication_date ?? null,
    nsfw: raw.nsfw,
    top_cover: cover,
    author_name: raw.author?.name ?? null,
  }
  return {
    kind: 'light_novel',
    entity_id: raw.id,
    display: {
      title,
      subtitle,
      cover,
      meta: joinMeta(['轻小说', yearOf(raw.publication_date as string | null), raw.author?.name]),
      nsfw: raw.nsfw,
    },
    summary,
  }
}

function lightNovelVolumeMap(
  raw: Schemas['LightNovelVolumeSummaryDto'],
): PickedFor<'light_novel_volume'> {
  const title =
    raw.name_cn ||
    raw.name ||
    raw.volume_label ||
    (raw.volume_number != null ? `第 ${raw.volume_number} 卷` : '未命名')
  const series = raw.series?.name_cn || raw.series?.name || null
  const volumeTag =
    raw.volume_label || (raw.volume_number != null ? `第 ${raw.volume_number} 卷` : null)
  const cover = topWorkCover(raw.covers)
  const summary: LightNovelVolumeCardSummary = {
    id: raw.id,
    name: raw.name,
    name_cn: raw.name_cn ?? null,
    volume_number: raw.volume_number ?? null,
    volume_label: raw.volume_label ?? null,
    publication_date: raw.publication_date ?? null,
    nsfw: raw.series.nsfw,
    top_cover: cover,
    series_name: series,
  }
  return {
    kind: 'light_novel_volume',
    entity_id: raw.id,
    display: {
      title,
      subtitle: series,
      cover,
      meta: joinMeta(['轻小说卷', volumeTag, yearOf(raw.publication_date as string | null)]),
      nsfw: raw.series.nsfw,
    },
    summary,
  }
}

function mangaMap(raw: Schemas['MangaSummaryDto']): PickedFor<'manga'> {
  const title = raw.name_cn || raw.name
  const subtitle = raw.name_cn ? raw.name : null
  const cover = topWorkCover(raw.covers)
  const summary: MangaCardSummary = {
    id: raw.id,
    name: raw.name,
    name_cn: raw.name_cn ?? null,
    publication_date: raw.publication_date ?? null,
    nsfw: raw.nsfw,
    top_cover: cover,
    author_name: null,
  }
  return {
    kind: 'manga',
    entity_id: raw.id,
    display: {
      title,
      subtitle,
      cover,
      meta: joinMeta(['漫画', yearOf(raw.publication_date as string | null)]),
      nsfw: raw.nsfw,
    },
    summary,
  }
}

function personMap(raw: Schemas['EntitySummaryDto']): PickedFor<'person'> {
  const image: Schemas['MediaAssetDto'] | null = raw.cover
    ? { id: 0, src: raw.cover, width: null, height: null }
    : null
  const summary: PersonCardSummary = { id: raw.id, name: raw.name, image }
  return {
    kind: 'person',
    entity_id: raw.id,
    display: { title: raw.name, subtitle: null, cover: raw.cover, meta: '人物', nsfw: false },
    summary,
  }
}

function producerMap(raw: Schemas['EntitySummaryDto']): PickedFor<'producer'> {
  const logo: Schemas['MediaAssetDto'] | null = raw.cover
    ? { id: 0, src: raw.cover, width: null, height: null }
    : null
  const summary: ProducerCardSummary = { id: raw.id, name: raw.name, logo }
  return {
    kind: 'producer',
    entity_id: raw.id,
    display: { title: raw.name, subtitle: null, cover: raw.cover, meta: '厂商', nsfw: false },
    summary,
  }
}

function characterMap(raw: Schemas['EntitySummaryDto']): PickedFor<'character'> {
  const image: Schemas['MediaAssetDto'] | null = raw.cover
    ? { id: 0, src: raw.cover, width: null, height: null }
    : null
  const summary: CharacterCardSummary = { id: raw.id, name: raw.name, image }
  return {
    kind: 'character',
    entity_id: raw.id,
    display: { title: raw.name, subtitle: null, cover: raw.cover, meta: '角色', nsfw: false },
    summary,
  }
}

function articleMap(raw: Schemas['ArticleSummaryDto']): PickedFor<'article'> {
  const sectionName = raw.sections?.[0]?.section?.name ?? null
  const summary: ArticleCardSummary = {
    id: raw.id,
    title: raw.title,
    cover: raw.cover ?? null,
    creator: raw.creator ?? null,
    top_section_name: sectionName,
  }
  return {
    kind: 'article',
    entity_id: raw.id,
    display: {
      title: raw.title,
      subtitle: raw.creator ? displayName(raw.creator) : null,
      cover: raw.cover?.src ?? null,
      meta: joinMeta(['文章', sectionName]),
      nsfw: false,
    },
    summary,
  }
}

function postMap(raw: Schemas['PostSummaryDto']): PickedFor<'post'> {
  const sectionName = raw.sections?.[0]?.section?.name ?? null
  const cover = topCover(raw.covers)
  const summary: PostCardSummary = {
    id: raw.id,
    title: raw.title,
    top_cover: cover,
    creator: raw.creator ?? null,
    top_section_name: sectionName,
  }
  return {
    kind: 'post',
    entity_id: raw.id,
    display: {
      title: raw.title,
      subtitle: raw.creator ? displayName(raw.creator) : null,
      cover: cover?.src ?? null,
      meta: joinMeta(['图文', sectionName]),
      nsfw: false,
    },
    summary,
  }
}

function galgameRateMap(raw: Schemas['GalgameRateCardSummaryResDto']): PickedFor<'galgame_rate'> {
  return {
    kind: 'galgame_rate',
    entity_id: raw.id,
    display: {
      title: raw.galgame_title || '未命名作品',
      subtitle: null,
      cover: raw.galgame_cover,
      meta: joinMeta(['Galgame 评分', raw.rate != null ? `${raw.rate} 分` : null]),
      nsfw: raw.galgame_nsfw,
    },
    summary: raw,
  }
}

function lightNovelRateMap(
  raw: Schemas['LightNovelRateCardSummaryResDto'],
): PickedFor<'light_novel_rate'> {
  return {
    kind: 'light_novel_rate',
    entity_id: raw.id,
    display: {
      title: raw.light_novel_title || '未命名作品',
      subtitle: null,
      cover: raw.light_novel_cover,
      meta: joinMeta(['轻小说评分', raw.rate != null ? `${raw.rate} 分` : null]),
      nsfw: raw.light_novel_nsfw,
    },
    summary: raw,
  }
}

function mangaRateMap(raw: Schemas['MangaRateCardSummaryResDto']): PickedFor<'manga_rate'> {
  return {
    kind: 'manga_rate',
    entity_id: raw.id,
    display: {
      title: raw.manga_title || '未命名作品',
      subtitle: null,
      cover: raw.manga_cover,
      meta: joinMeta(['漫画评分', raw.rate != null ? `${raw.rate} 分` : null]),
      nsfw: raw.manga_nsfw,
    },
    summary: raw,
  }
}

export async function searchEntities(
  type: EntityCardType,
  keyword: string,
): Promise<PickedEntity[]> {
  const query = { search: keyword, page: 1, page_size: SEARCH_PAGE_SIZE } as const
  switch (type) {
    case 'galgame': {
      const res = await hikariRequest('/api/v3/galgames', { query })
      return res.items.map(galgameMap)
    }
    case 'light_novel': {
      const res = await hikariRequest('/api/v3/light-novels', { query })
      return res.items.map(lightNovelMap)
    }
    case 'light_novel_volume': {
      const res = await hikariRequest('/api/v3/light-novel-volumes', { query })
      return res.items.map(lightNovelVolumeMap)
    }
    case 'manga': {
      const res = await hikariRequest('/api/v3/mangas', { query })
      return res.items.map(mangaMap)
    }
    case 'person': {
      const res = await hikariRequest('/api/v3/people', { query })
      return res.items.map(personMap)
    }
    case 'producer': {
      const res = await hikariRequest('/api/v3/producers', { query })
      return res.items.map(producerMap)
    }
    case 'character': {
      const res = await hikariRequest('/api/v3/characters', { query })
      return res.items.map(characterMap)
    }
    case 'article': {
      const res = await hikariRequest('/api/v3/articles', { query })
      return res.items.map(articleMap)
    }
    case 'post': {
      const res = await hikariRequest('/api/v3/posts', { query })
      return res.items.map(postMap)
    }
    case 'galgame_rate': {
      const res = await hikariRequest('/api/v3/user/me/rates/galgame/cards', { query })
      return res.items.map(galgameRateMap)
    }
    case 'light_novel_rate': {
      const res = await hikariRequest('/api/v3/user/me/rates/light-novel/cards', { query })
      return res.items.map(lightNovelRateMap)
    }
    case 'manga_rate': {
      const res = await hikariRequest('/api/v3/user/me/rates/manga/cards', { query })
      return res.items.map(mangaRateMap)
    }
  }
}
