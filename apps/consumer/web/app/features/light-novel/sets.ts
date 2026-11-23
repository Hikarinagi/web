import type { ApiData } from '@hikarinagi/api-contract/v3'
import { volumeSetName } from '@hikarinagi/shared'
import type { VolumeGroup } from '~/features/volume-set/sets'

export type LightNovelVolumeSet = ApiData<'/api/v3/light-novels/{id}/sets', 'get'>[number]

type ShelfVolume = LightNovelVolumeSet['volumes'][number]

export function shelfGroups(source: {
  volumes: ShelfVolume[]
  sets: LightNovelVolumeSet[]
}): VolumeGroup<ShelfVolume>[] {
  const groups = source.sets
    .filter(set => set.volumes.some(volume => volume.online_reading_available))
    .map(set => ({
      key: set.id,
      name: volumeSetName(set),
      original: set.original,
      items: set.volumes,
    }))
  return groups.length ? groups : [{ key: 0, name: '', original: true, items: source.volumes }]
}
