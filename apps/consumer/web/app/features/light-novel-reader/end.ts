import { TimeFormatEnum, timeFormat } from '~/utils/time-format'

export function readTime(ms: number) {
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return '不足 1 分钟'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${minutes} 分钟`
  return rest ? `${hours} 小时 ${rest} 分` : `${hours} 小时`
}

export function readSpan(startedAt: string, now = new Date()) {
  const start = new Date(startedAt)
  const day = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const date = timeFormat(
    start,
    start.getFullYear() === now.getFullYear() ? TimeFormatEnum.M_D_CN : TimeFormatEnum.YYYY_M_D_CN,
  )
  const days = Math.round((day(now) - day(start)) / 86_400_000) + 1
  return days > 1 ? `自 ${date}起，历时 ${days} 天` : `${date}开始阅读，当天读完`
}
