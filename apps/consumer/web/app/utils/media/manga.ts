import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
import { translate } from '~/utils/i18n'
import { topVotedMedia } from './image'

type MangaDetail = MangaPageData['manga']
type MangaCover = MangaDetail['covers'][number]['media']

export function getMangaTitle(manga: MangaDetail) {
  return manga.name_cn || manga.name
}

export function getMangaCover(manga: MangaDetail): MangaCover | null {
  return topVotedMedia(manga.covers)
}

type MangaVolumeNumber = { volume_label?: string | null; volume_number?: number | null }

export function getMangaVolumeLabel(volume: MangaVolumeNumber) {
  const label = volume.volume_label?.trim() || null
  if (label && !/^\d+(\.\d+)?$/.test(label)) return label
  const number = label ?? volume.volume_number
  return number != null ? translate('book.volume.number', { number }) : null
}

export function getMangaVolumeTitle(
  volume: MangaVolumeNumber & { name?: string | null; name_cn?: string | null },
) {
  return (
    volume.name_cn ||
    volume.name ||
    getMangaVolumeLabel(volume) ||
    translate('book.volume.untitled')
  )
}
