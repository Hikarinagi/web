import type { components } from '@hikarinagi/api-contract/v3'
import { volumeSetName, type VolumeSetNameSource } from '@hikarinagi/shared'
import { TimeFormatEnum, timeFormat } from '~/utils/time-format'

export interface VolumeDrawerRow {
  id: number
  to: string
  cover: components['schemas']['RatedMediaAssetDto'] | null
  label: string
  name: string
  meta: string
}

export interface VolumeGroup<T> {
  key: number
  name: string
  original: boolean
  items: T[]
}

export function volumeSetLabel(set: VolumeSetNameSource & { volume_count: number }) {
  return `${volumeSetName(set)} ${set.volume_count} 卷`
}

export function volumeDrawerMeta(volume: { publication_date: string | null; isbn: string | null }) {
  return [
    timeFormat(volume.publication_date, TimeFormatEnum.YYYY_MM_DD),
    volume.isbn ? `ISBN ${volume.isbn}` : '',
  ]
    .filter(Boolean)
    .join('，')
}
