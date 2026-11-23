import type { ApiData } from '@hikarinagi/api-contract/v3'
import { volumeSetKey, volumeSetName } from '@hikarinagi/shared'
import type { VolumeGroup } from '~/features/volume-set/sets'
import type { ContentsItem } from './contents'

export type MangaVolumeSet = ApiData<'/api/v3/mangas/{id}/sets', 'get'>[number]

export function contentsGroups(volumes: ContentsItem[]): VolumeGroup<ContentsItem>[] {
  const groups = new Map<number, ContentsItem[]>()
  for (const item of volumes) {
    const key = volumeSetKey(item)
    const items = groups.get(key)
    if (items) items.push(item)
    else groups.set(key, [item])
  }
  return [...groups].map(([key, items]) => ({
    key,
    name:
      items.find(item => item.volume_set)?.volume_set?.name ??
      volumeSetName({ name: null, edition: null, original: true, labels: [], publishers: [] }),
    original: key === 0,
    items,
  }))
}
