import type { ApiData } from '@hikarinagi/api-contract/v3'
import { topVotedMedia, type HikariImageSource } from '~/utils/media/image'

type GalgameItem = ApiData<'/api/v3/landing/galgames', 'get'>['playing'][number]
type NovelItem = ApiData<'/api/v3/landing/light-novels', 'get'>['hot'][number]
type MangaItem = ApiData<'/api/v3/landing/mangas', 'get'>['hot'][number]

export interface LandingWork {
  id: number
  to: string
  title: string
  original?: string
  sub: string
  cover: HikariImageSource
}

export type LandingRatio = '3/4' | '2/3'

export function galgameWork(item: Omit<GalgameItem, 'people' | 'score'>): LandingWork {
  return {
    id: item.id,
    to: `/galgames/${item.id}`,
    title: item.trans_title || item.origin_title || `Galgame #${item.id}`,
    original: item.trans_title ? item.origin_title : undefined,
    sub: item.maker ?? '',
    cover: topVotedMedia(item.covers),
  }
}

export function novelWork(item: Omit<NovelItem, 'volume_count'>): LandingWork {
  return {
    id: item.id,
    to: `/light-novels/${item.id}`,
    title: item.name_cn || item.name || `轻小说 #${item.id}`,
    original: item.name_cn ? item.name : undefined,
    sub: item.maker ?? '',
    cover: topVotedMedia(item.covers),
  }
}

export function mangaWork(item: Omit<MangaItem, 'chapter' | 'chapters'>): LandingWork {
  return {
    id: item.id,
    to: `/mangas/${item.id}`,
    title: item.name_cn || item.name || `漫画 #${item.id}`,
    original: item.name_cn ? item.name : undefined,
    sub: item.maker ?? '',
    cover: topVotedMedia(item.covers),
  }
}
