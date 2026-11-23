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

export interface VolumeSetOption {
  value: number
  label: string
  key: number
  original: boolean
}

type VolumeSetSource = VolumeSetNameSource & { id: number; volume_count: number }

export function volumeSetLabel(set: VolumeSetSource) {
  return `${volumeSetName(set)} ${set.volume_count} 卷`
}

export function volumeSetOption(set: VolumeSetSource): VolumeSetOption {
  return {
    value: set.id,
    label: volumeSetLabel(set),
    key: set.original ? 0 : set.id,
    original: set.original,
  }
}

export function volumeDrawerMeta(volume: { publication_date: string | null; isbn: string | null }) {
  return [
    timeFormat(volume.publication_date, TimeFormatEnum.YYYY_MM_DD),
    volume.isbn ? `ISBN ${volume.isbn}` : '',
  ]
    .filter(Boolean)
    .join('，')
}

export function chosenSetOption(
  options: VolumeSetOption[],
  chosen: number | null | undefined,
): VolumeSetOption | null {
  return (
    options.find(item => item.value === chosen) ??
    options.find(item => item.original) ??
    options[0] ??
    null
  )
}
