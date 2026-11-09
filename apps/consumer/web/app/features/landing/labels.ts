import type { ApiData } from '@hikarinagi/api-contract/v3'

type LandingReason = ApiData<'/api/v3/landing/galgames/feed', 'get'>['items'][number]['reason']
type LandingChapter = NonNullable<
  ApiData<'/api/v3/landing/mangas', 'get'>['hot'][number]['chapter']
>

export type LandingKind = 'galgame' | 'light_novel' | 'manga'

const TIME = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

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

export function timeLabel(at: string) {
  return TIME.format(new Date(at))
}

export function yenLabel(amount: string) {
  return `${Math.round(Number(amount)).toLocaleString('en-US')} 日元`
}

export function chapterLabel(
  chapter: Pick<LandingChapter, 'type' | 'number' | 'title'> | null | undefined,
) {
  if (!chapter) return ''
  const type = chapter.type.toLowerCase()
  const number = chapter.number?.replace(/^0+(?=\d)/, '') ?? null
  if (type === 'serialization' && number)
    return /^\d+(\.\d+)?$/.test(number) ? `第 ${number} 话` : number
  if (chapter.title) return chapter.title
  if (type === 'volume' && number) return `第 ${number} 卷`
  return type === 'extra' ? '番外' : ''
}

export function volumeLabel(volume: { title: string | null; number: string | null }) {
  if (volume.number && /^\d+(\.\d+)?$/.test(volume.number)) return `第 ${volume.number} 卷`
  return volume.title ?? volume.number ?? ''
}

export function reasonLabel(reason: LandingReason, kind: LandingKind) {
  if (reason.kind === 'SIMILAR' && reason.ref) return `与《${reason.ref.title}》相似`
  return reason.kind === 'ACCLAIMED' ? ACCLAIMED[kind] : '本周热门'
}
