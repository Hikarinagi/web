import { belongsTo } from '~/features/manga/volumes'
import { getMangaEpisodeLabel, getMangaVolumeLabel } from '~/utils/media/manga'
import type { MangaTargetChapter, MangaTargetClaim, MangaTargetVolume } from './manga-target'

export const NEW_TARGET = 'new'

export interface TargetOption {
  value: number | typeof NEW_TARGET
  label: string
  disabled?: boolean
}

export function chapterOptions(
  chapters: MangaTargetChapter[],
  claims: MangaTargetClaim[],
): TargetOption[] {
  const taken = new Set(claims.map(claim => claim.chapter?.id))
  return [
    ...chapters
      .filter(chapter => chapter.chapter_type !== 'VOLUME' && !chapter.page_count)
      .map(chapter => {
        const label = getMangaEpisodeLabel(chapter)
        return taken.has(chapter.id)
          ? { value: chapter.id, label: `${label}（进行中）`, disabled: true }
          : { value: chapter.id, label }
      }),
    { value: NEW_TARGET, label: '新章节' },
  ]
}

export function volumeOptions(
  volumes: MangaTargetVolume[],
  chapters: MangaTargetChapter[],
  claims: MangaTargetClaim[],
): TargetOption[] {
  const filled = chapters.filter(
    chapter => chapter.chapter_type === 'VOLUME' && chapter.page_count > 0,
  )
  const claimed = claims.filter(claim => claim.scope === 'VOLUME')
  return [
    ...volumes.map(volume => {
      const label = getMangaVolumeLabel(volume)
      if (filled.some(chapter => belongsTo(chapter, volume))) {
        return { value: volume.id, label: `${label}（已收录）`, disabled: true }
      }
      const claim = claimed.find(claim => belongsTo(claim, volume))
      if (claim) {
        const who = claim.owner.nickname || claim.owner.name
        return { value: volume.id, label: `${label}（${who} 正在上传）`, disabled: true }
      }
      return { value: volume.id, label }
    }),
    { value: NEW_TARGET, label: '新建这一卷的条目…' },
  ]
}

export function firstFree(options: TargetOption[]): number | null {
  const found = options.find(option => !option.disabled && option.value !== NEW_TARGET)
  return typeof found?.value === 'number' ? found.value : null
}
