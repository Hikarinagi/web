import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
import { topVotedMedia } from './image'

type MangaDetail = MangaPageData['manga']
type MangaCover = MangaDetail['covers'][number]['media']

export function getMangaTitle(manga: MangaDetail) {
  return manga.name_cn || manga.name
}

export function getMangaCover(manga: MangaDetail): MangaCover | null {
  return topVotedMedia(manga.covers)
}

export function getMangaEpisodeLabel(chapter: {
  chapter_number?: string | null
  name?: string | null
  name_cn?: string | null
}) {
  if (chapter.chapter_number) return `第 ${chapter.chapter_number} 话`
  return chapter.name_cn || chapter.name || '未命名'
}

export function getMangaVolumeLabel(chapter: {
  volume_number?: number | null
  name?: string | null
  name_cn?: string | null
}) {
  if (chapter.volume_number != null) return `第 ${chapter.volume_number} 卷`
  return chapter.name_cn || chapter.name || '单行本'
}

export function getMangaVolumeTitle(chapter: {
  volume_number?: number | null
  name?: string | null
  name_cn?: string | null
}) {
  return chapter.name_cn || chapter.name || getMangaVolumeLabel(chapter)
}
