import type { ContentsItem } from '~/features/manga/contents'
import { volumeNumbers } from '~/features/manga/volume-number'

interface VolumeRef {
  id: number
  volume_number: number | null
}

interface VolumeLike extends VolumeRef {
  name: string | null
  name_cn: string | null
  sort_key: number
  publication_date: string | null
}

type ChapterPlacement = Pick<ContentsItem, 'chapter_type' | 'volume_id' | 'volume_number'>

export function effectiveVolumeNumber(volume: VolumeRef, volumes: VolumeLike[]): number | null {
  if (volume.volume_number != null) return volume.volume_number
  for (const [number, id] of volumeNumbers(volumes)) if (id === volume.id) return number
  return null
}

export function belongsTo(
  chapter: Pick<ContentsItem, 'volume_id' | 'volume_number'>,
  volume: VolumeRef,
  volumeNumber: number | null = volume.volume_number,
) {
  if (chapter.volume_id != null) return chapter.volume_id === volume.id
  return chapter.volume_number != null && chapter.volume_number === volumeNumber
}

export function wholeVolumeOf<T extends ChapterPlacement>(
  chapters: T[],
  volume: VolumeRef,
  volumes: VolumeLike[] = [],
): T | null {
  const number = effectiveVolumeNumber(volume, volumes)
  return chapters.find(c => c.chapter_type === 'VOLUME' && belongsTo(c, volume, number)) ?? null
}

export function chaptersInVolume<T extends ChapterPlacement>(
  chapters: T[],
  volume: VolumeRef,
  volumes: VolumeLike[] = [],
): T[] {
  const number = effectiveVolumeNumber(volume, volumes)
  return chapters.filter(c => c.chapter_type !== 'VOLUME' && belongsTo(c, volume, number))
}
