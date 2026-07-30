type TimeValue = Date | number | string | null | undefined

export enum TimeFormatEnum {
  YYYY_MM_DD_HH_MM_SS = 'yyyy-MM-dd HH:mm:ss',
  YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm',
  YYYY_MM_DD = 'yyyy-MM-dd',
  YYYY_M_D_CN = 'yyyy 年 M 月 d 日',
  YYYY_M_DD_CN = 'yyyy年M月dd日',
  YYYY_MM = 'yyyy-MM',
  MM_DD_HH_MM = 'MM-dd HH:mm',
  MM_DD = 'MM-dd',
  M_D_CN = 'M 月 d 日',
  HH_MM = 'HH:mm',
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function timeFormat(
  value: TimeValue,
  formatPattern: TimeFormatEnum = TimeFormatEnum.YYYY_MM_DD_HH_MM_SS,
  options?: { timeZone?: string },
) {
  const date = parseTimeValue(value)
  if (!date) return ''

  const { year, month, day, hour, minute, second } = options?.timeZone
    ? partsInTimeZone(date, options.timeZone)
    : {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
      }

  return formatPattern.replace(/yyyy|MM|M|dd|d|HH|H|mm|m|ss|s/g, token => {
    switch (token) {
      case 'yyyy':
        return String(year)
      case 'MM':
        return pad(month)
      case 'M':
        return String(month)
      case 'dd':
        return pad(day)
      case 'd':
        return String(day)
      case 'HH':
        return pad(hour)
      case 'H':
        return String(hour)
      case 'mm':
        return pad(minute)
      case 'm':
        return String(minute)
      case 'ss':
        return pad(second)
      case 's':
        return String(second)
      default:
        return token
    }
  })
}

export function timeBrief(value: TimeValue) {
  const date = parseTimeValue(value)
  if (!date) return ''
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return timeFormat(date, sameYear ? TimeFormatEnum.MM_DD_HH_MM : TimeFormatEnum.YYYY_MM_DD_HH_MM)
}

export function datePartFormat(
  value: string | null | undefined,
  formatPattern: TimeFormatEnum = TimeFormatEnum.YYYY_MM_DD,
) {
  if (!value) return ''
  return timeFormat(value.slice(0, 10), formatPattern)
}

export function timeFromNow(value: TimeValue) {
  const date = parseTimeValue(value)
  if (!date) return ''

  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (diffSeconds < 60) return '刚刚'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}分钟前`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}小时前`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}天前`

  return timeFormat(date, TimeFormatEnum.YYYY_MM_DD)
}

function parseTimeValue(value: TimeValue) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  if (typeof value === 'string') {
    const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value)
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch
      return new Date(Number(year), Number(month) - 1, Number(day))
    }
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function partsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)?.value ?? 0)
  return {
    year: lookup('year'),
    month: lookup('month'),
    day: lookup('day'),
    hour: lookup('hour'),
    minute: lookup('minute'),
    second: lookup('second'),
  }
}
