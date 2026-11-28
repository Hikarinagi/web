import { formatDate } from '~/utils/time-format'

export function readTime(ms: number) {
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return translate('reader.end.underMinute')
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return translate('reader.end.minutes', { minutes })
  return rest
    ? translate('reader.end.hoursMinutes', { hours, minutes: rest })
    : translate('reader.end.hours', { hours })
}

export function readSpan(startedAt: string, now = new Date()) {
  const start = new Date(startedAt)
  const day = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const date = formatDate(start, start.getFullYear() === now.getFullYear() ? 'monthDay' : 'date')
  const days = Math.round((day(now) - day(start)) / 86_400_000) + 1
  return days > 1
    ? translate('reader.end.span', { date, days })
    : translate('reader.end.sameDay', { date })
}
