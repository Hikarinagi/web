import type { ApiData } from '@hikarinagi/api-contract/v3'
import { mangaReadingUnit, volumeSetKey } from '@hikarinagi/shared'
import { chosenSetOption, volumeSetOption, type VolumeSetOption } from '~/features/volume-set/sets'
import type { ContentsItem } from './contents'

export type MangaVolumeSet = ApiData<'/api/v3/mangas/{id}/sets', 'get'>[number]

export function contentsSets(
  items: Pick<ContentsItem, 'chapter_type' | 'readable' | 'volume_set'>[],
  sets: MangaVolumeSet[],
): VolumeSetOption[] {
  const held = new Set(
    items
      .filter(item => item.readable && mangaReadingUnit(item.chapter_type) === 'volume')
      .map(volumeSetKey),
  )
  return sets.map(volumeSetOption).filter(option => held.has(option.key))
}

export function contentsSetKey(
  options: VolumeSetOption[],
  chosen: number | null | undefined,
): number | null {
  return chosenSetOption(options, chosen)?.key ?? null
}
