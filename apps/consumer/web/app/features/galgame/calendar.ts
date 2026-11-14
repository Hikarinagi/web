import type { ApiData } from '@hikarinagi/api-contract/v3'
import { topVotedMedia } from '~/utils/media/image'

type CalendarItem = ApiData<'/api/v3/landing/galgames/calendar', 'get'>['items'][number]

export function readCalendarQuery(query: Record<string, unknown>): string | undefined {
  const raw = Array.isArray(query.month) ? query.month[0] : query.month
  return typeof raw === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) ? raw : undefined
}

export function calendarBff(month?: string): `/api/pages/${string}` {
  return `/api/pages/galgames/calendar${month ? `?month=${month}` : ''}`
}

export function calendarRoute(month?: string) {
  return `/galgames/calendar${month ? `?month=${month}` : ''}`
}

export function shiftMonth(month: string, delta: number) {
  const [year, index] = month.split('-').map(Number)
  const total = year! * 12 + index! - 1 + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

export function monthLength(month: string) {
  const [year, index] = month.split('-').map(Number)
  return new Date(Date.UTC(year!, index!, 0)).getUTCDate()
}

export function calendarDays<
  T extends Pick<CalendarItem, 'release_date' | 'release_date_precision'>,
>(items: T[]) {
  const days = new Map<string, T[]>()
  for (const item of items) {
    const date =
      item.release_date_precision === 'DAY' && item.release_date
        ? item.release_date.slice(0, 10)
        : ''
    days.set(date, [...(days.get(date) ?? []), item])
  }
  return [...days].map(([date, list]) => ({ date, list }))
}

export function coverRatio(item: Pick<CalendarItem, 'covers'>) {
  const media = topVotedMedia(item.covers)
  return media?.width && media.height ? media.width / media.height : 3 / 4
}
