import type { ApiData } from '@hikarinagi/api-contract/v3'
import { mangaChapterLabel, type VolumeSetRef } from '@hikarinagi/shared'
import { getLightNovelVolumeLabel } from '~/utils/media/light-novel'

type LandingReason = ApiData<'/api/v3/landing/galgames/feed', 'get'>['items'][number]['reason']
type LandingChapter = NonNullable<
  ApiData<'/api/v3/landing/mangas', 'get'>['hot'][number]['chapter']
>
type NovelReading = ApiData<'/api/v3/reader/me/reading', 'get'>['items'][number]

export type LandingKind = 'galgame' | 'light_novel' | 'manga'

const ACCLAIMED: Record<LandingKind, string> = {
  galgame: '高分作品',
  light_novel: '已完结，全卷可读',
  manga: '热门完结作品',
}

export function dayLabel(date: string) {
  const [, month, day] = date.split('-').map(Number)
  return `${month} 月 ${day} 日`
}

export function weekdayLabel(date: string) {
  return `周${'日一二三四五六'[new Date(`${date}T00:00:00Z`).getUTCDay()]}`
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000)
}

export function relativeDay(date: string, today: string) {
  const diff = daysBetween(date, today)
  return diff === 0 ? '今天' : diff === 1 ? '昨天' : dayLabel(date)
}

export function yenLabel(amount: string) {
  return `${Math.round(Number(amount)).toLocaleString('en-US')} 日元`
}

export function chapterLabel(
  chapter:
    | (Pick<LandingChapter, 'type' | 'number' | 'title'> &
        Partial<Pick<LandingChapter, 'volume_number' | 'volume_set'>>)
    | null
    | undefined,
) {
  if (!chapter) return ''
  const type = chapter.type.toLowerCase()
  const number = chapter.number?.replace(/^0+(?=\d)/, '') ?? null
  if (type === 'volume')
    return mangaChapterLabel({
      chapter_type: 'VOLUME',
      chapter_number: null,
      volume_number:
        chapter.volume_number ?? (number && /^\d+$/.test(number) ? Number(number) : null),
      title: chapter.title,
      volume_set: chapter.volume_set ?? null,
    })
  if (type === 'serialization' && number)
    return /^\d+(\.\d+)?$/.test(number) ? `第 ${number} 话` : number
  if (chapter.title) return chapter.title
  return type === 'extra' ? '番外' : ''
}

export function volumeLabel(volume: {
  title: string | null
  number: string | null
  volume_set?: Pick<VolumeSetRef, 'name' | 'original'> | null
}) {
  const set = volume.volume_set && !volume.volume_set.original ? `${volume.volume_set.name} ` : ''
  if (volume.number && /^\d+(\.\d+)?$/.test(volume.number)) return `${set}第 ${volume.number} 卷`
  return volume.title ?? (volume.number ? `${set}${volume.number}` : '')
}

export function novelReading(item: NovelReading) {
  const number = item.current_volume_number
  if (number && item.current_volume_set?.original === false)
    return {
      note: `读到${getLightNovelVolumeLabel({ volume_label: null, volume_number: number, volume_set: item.current_volume_set })}`,
      progress: undefined,
    }
  if (number && item.total_volumes)
    return {
      note: `读到第 ${number} 卷，共 ${item.total_volumes} 卷`,
      progress: Math.min(1, number / item.total_volumes),
    }
  return { note: item.current_volume_title ?? '', progress: undefined }
}

export function reasonLabel(reason: LandingReason, kind: LandingKind) {
  if (reason.kind === 'SIMILAR' && reason.ref) return `与《${reason.ref.title}》相似`
  return reason.kind === 'ACCLAIMED' ? ACCLAIMED[kind] : '本周热门'
}
