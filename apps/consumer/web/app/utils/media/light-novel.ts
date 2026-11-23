import type { VolumeSetRef } from '@hikarinagi/shared'
import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
import { topVotedMedia } from './image'

type LightNovelDetail = LightNovelPageData['light_novel']
type LightNovelVolume = LightNovelPageData['volumes'][number] | LightNovelVolumePageData['volume']
type LightNovelCover = LightNovelDetail['covers'][number]['media']

export function getLightNovelTitle(lightNovel: LightNovelDetail) {
  return lightNovel.name_cn || lightNovel.name
}

export function getLightNovelCover(lightNovel: LightNovelDetail): LightNovelCover | null {
  return topVotedMedia(lightNovel.covers)
}

export function getLightNovelCoverSrc(lightNovel: LightNovelDetail) {
  return getLightNovelCover(lightNovel)?.src || undefined
}

type VolumeLabelSource = Pick<LightNovelVolume, 'volume_label' | 'volume_number'> & {
  volume_set?: Pick<VolumeSetRef, 'name' | 'original'> | null
}

export function getLightNovelVolumeTitle(
  volume: Pick<LightNovelVolume, 'name' | 'name_cn'> & VolumeLabelSource,
) {
  return volume.name_cn || volume.name || getLightNovelVolumeLabel(volume) || '未命名'
}

export function getLightNovelVolumeLabel(volume: VolumeLabelSource) {
  const set = volume.volume_set && !volume.volume_set.original ? `${volume.volume_set.name} ` : ''
  const label = volume.volume_label
  if (label && !/^\d+(\.\d+)?$/.test(label)) return `${set}${label}`
  const number = label ?? volume.volume_number
  return number != null ? `${set}第 ${number} 卷` : null
}
