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
