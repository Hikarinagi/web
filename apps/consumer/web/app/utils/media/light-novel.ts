import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
import { topVotedMedia } from './image'

type LightNovelDetail = LightNovelPageData['light_novel']
type LightNovelVolume = LightNovelPageData['volumes'][number] | LightNovelVolumePageData['volume']
type LightNovelCover = LightNovelDetail['covers'][number]['media']
type LightNovelVolumeCover = LightNovelVolume['covers'][number]['media']

export function getLightNovelTitle(lightNovel: LightNovelDetail) {
  return lightNovel.name_cn || lightNovel.name
}

export function getLightNovelCover(lightNovel: LightNovelDetail): LightNovelCover | null {
  return topVotedMedia(lightNovel.covers)
}

export function getLightNovelCoverSrc(lightNovel: LightNovelDetail) {
  return getLightNovelCover(lightNovel)?.src || undefined
}

export function getLightNovelVolumeTitle(
  volume: Pick<LightNovelVolume, 'name' | 'name_cn' | 'volume_label' | 'volume_number'>,
) {
  return volume.name_cn || volume.name || getLightNovelVolumeLabel(volume) || '未命名'
}

export function getLightNovelVolumeLabel(
  volume: Pick<LightNovelVolume, 'volume_label' | 'volume_number'>,
) {
  return (
    volume.volume_label || (volume.volume_number != null ? `第 ${volume.volume_number} 卷` : null)
  )
}

export function getLightNovelVolumeCover(volume: LightNovelVolume): LightNovelVolumeCover | null {
  return topVotedMedia(volume.covers)
}

export function getLightNovelVolumeCoverSrc(volume: LightNovelVolume) {
  return getLightNovelVolumeCover(volume)?.src || undefined
}
