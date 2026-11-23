import type { ApiData } from '@hikarinagi/api-contract/v3'
import { volumeSetOption, type VolumeSetOption } from '~/features/volume-set/sets'

export type LightNovelVolumeSet = ApiData<'/api/v3/light-novels/{id}/sets', 'get'>[number]

export function shelfSets(sets: LightNovelVolumeSet[]): VolumeSetOption[] {
  return sets
    .filter(set => set.volumes.some(volume => volume.online_reading_available))
    .map(volumeSetOption)
}
