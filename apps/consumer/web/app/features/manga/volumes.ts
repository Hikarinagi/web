import { volumeNumbers } from '~/features/manga/volume-number'
import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

type Chapter = MangaPageData['chapters'][number]
type VolumeEntry = MangaPageData['volumes'][number]

export interface VolumeCard {
  key: string
  entry: VolumeEntry | null
  volume_number: number | null
  title: string
  cover: VolumeEntry['cover'] | null
  year: string
  whole: Chapter | null
  episode_count: number
}

interface VolumeRef {
  id: number
  volume_number: number | null
}

type VolumeLike = Pick<
  VolumeEntry,
  'id' | 'volume_number' | 'name' | 'name_cn' | 'sort_key' | 'publication_date'
>

export function effectiveVolumeNumber(volume: VolumeRef, volumes: VolumeLike[]): number | null {
  if (volume.volume_number != null) return volume.volume_number
  for (const [number, id] of volumeNumbers(volumes)) if (id === volume.id) return number
  return null
}

export function belongsTo(
  chapter: Pick<Chapter, 'volume_id' | 'volume_number'>,
  volume: VolumeRef,
  volumeNumber: number | null = volume.volume_number,
) {
  if (chapter.volume_id != null) return chapter.volume_id === volume.id
  return chapter.volume_number != null && chapter.volume_number === volumeNumber
}

export function wholeVolumeOf<T extends Chapter>(
  chapters: T[],
  volume: VolumeRef,
  volumes: VolumeLike[] = [],
): T | null {
  const number = effectiveVolumeNumber(volume, volumes)
  return chapters.find(c => c.chapter_type === 'VOLUME' && belongsTo(c, volume, number)) ?? null
}

export function chaptersInVolume<T extends Chapter>(
  chapters: T[],
  volume: VolumeRef,
  volumes: VolumeLike[] = [],
): T[] {
  const number = effectiveVolumeNumber(volume, volumes)
  return chapters
    .filter(c => c.chapter_type !== 'VOLUME' && belongsTo(c, volume, number))
    .sort((a, b) => a.sort_key - b.sort_key)
}

export function volumeCards(volumes: VolumeEntry[], chapters: Chapter[]): VolumeCard[] {
  const wholes = chapters.filter(c => c.chapter_type === 'VOLUME')
  const episodes = chapters.filter(c => c.chapter_type !== 'VOLUME')
  const used = new Set<number>()
  const cards: VolumeCard[] = volumes.map(entry => {
    const number = effectiveVolumeNumber(entry, volumes)
    const whole = wholeVolumeOf(wholes, entry, volumes)
    if (whole) used.add(whole.id)
    return {
      key: `entry-${entry.id}`,
      entry,
      volume_number: number,
      title:
        entry.name_cn ||
        entry.name ||
        (entry.volume_number != null ? `第 ${entry.volume_number} 卷` : '单行本'),
      cover: entry.cover,
      year: entry.publication_date ? `${entry.publication_date.slice(0, 4)} 年` : '',
      whole,
      episode_count: chaptersInVolume(episodes, entry, volumes).length,
    }
  })
  for (const whole of wholes) {
    if (used.has(whole.id)) continue
    cards.push({
      key: `chapter-${whole.id}`,
      entry: null,
      volume_number: whole.volume_number,
      title:
        whole.volume_number != null
          ? `第 ${whole.volume_number} 卷`
          : whole.name_cn || whole.name || '单行本',
      cover: whole.cover,
      year: whole.publication_date ? `${whole.publication_date.slice(0, 4)} 年` : '',
      whole,
      episode_count: 0,
    })
  }
  return cards.sort((a, b) => {
    if (a.volume_number != null && b.volume_number != null) return a.volume_number - b.volume_number
    if (a.volume_number != null) return -1
    if (b.volume_number != null) return 1
    return (a.whole?.sort_key ?? 0) - (b.whole?.sort_key ?? 0)
  })
}
