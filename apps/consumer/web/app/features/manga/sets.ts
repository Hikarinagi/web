import type { ApiData } from '@hikarinagi/api-contract/v3'
import { mangaReadingUnit, mangaSetKey, mangaSetName } from '@hikarinagi/shared'
import type { ContentsItem } from './contents'

export type MangaVolumeSet = ApiData<'/api/v3/mangas/{id}/sets', 'get'>[number]

export interface ContentsSetOption {
  value: number
  label: string
  key: number
  original: boolean
}

export function volumeSetLabel(set: MangaVolumeSet) {
  return `${mangaSetName(set)} ${set.volume_count} 卷`
}

export function contentsSets(
  items: Pick<ContentsItem, 'chapter_type' | 'readable' | 'volume_set'>[],
  sets: MangaVolumeSet[],
): ContentsSetOption[] {
  const held = new Set(
    items
      .filter(item => item.readable && mangaReadingUnit(item.chapter_type) === 'volume')
      .map(mangaSetKey),
  )
  return sets.flatMap(set => {
    const key = set.original ? 0 : set.id
    return held.has(key)
      ? [{ value: set.id, label: volumeSetLabel(set), key, original: set.original }]
      : []
  })
}

export function contentsSetKey(
  options: ContentsSetOption[],
  chosen: number | null | undefined,
): number | null {
  const option =
    options.find(item => item.value === chosen) ?? options.find(item => item.original) ?? options[0]
  return option?.key ?? null
}
