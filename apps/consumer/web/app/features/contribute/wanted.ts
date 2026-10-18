import type { ContributePageData } from '~~/server/api/pages/contribute.get'
import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'
import { getMangaEpisodeLabel } from '~/utils/media/manga'

export type WantedVolume = ContributePageData['volumes'][number]
export type WantedChapter = ContributePageData['chapters'][number]
export type WantedMangaVolume = ContributePageData['manga_volumes'][number]

export const PROJECT_COPY = {
  ENTRY: '正在录入',
  TRANSLATION: '正在翻译',
  UPLOAD: '正在上传',
} as const

export function volumeLabel(volume: Parameters<typeof getLightNovelVolumeTitle>[0]) {
  return getLightNovelVolumeLabel(volume) ?? getLightNovelVolumeTitle(volume)
}

export function volumeNote(volume: WantedVolume) {
  return `${volume.readers} 位读者已读完${volumeLabel(volume.previous)}`
}

export function chapterNote(chapter: WantedChapter) {
  return `${chapter.readers} 位读者已读至${getMangaEpisodeLabel(chapter.previous)}`
}

export function mangaVolumeNote(volume: WantedMangaVolume) {
  return `此作品已被 ${volume.readers} 位读者收藏`
}
