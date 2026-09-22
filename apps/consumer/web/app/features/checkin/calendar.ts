import type { CheckInRecord, CheckInStatus } from './checkin'
import { dayKeyOf, monthOf } from './checkin'

export type CheckInCellState =
  'signed' | 'make-up' | 'today' | 'missed' | 'expired' | 'future' | 'normal' | 'other'

export interface CheckInCell {
  key: string
  day: number
  state: CheckInCellState
  method: 'points' | 'card' | null
}

const DAY_MS = 86_400_000

export function buildCells(options: {
  month: string
  records: CheckInRecord[]
  status: CheckInStatus | null
  ready: boolean
  now: Date
}): CheckInCell[] {
  const { month, records, status, ready, now } = options
  const [year, monthNumber] = month.split('-').map(Number)
  const month0 = (monthNumber ?? 1) - 1
  const recordMap = new Map(records.map(record => [record.date, record]))
  const todayKey = dayKeyOf(now)
  const todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const windowDays = status?.make_up.window_days ?? 0
  const byPoints = month === monthOf(now) && (status?.make_up.remaining ?? 0) > 0

  const lead = (new Date(year!, month0, 1).getDay() + 6) % 7
  const start = new Date(year!, month0, 1 - lead)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    const key = dayKeyOf(date)
    const day = date.getDate()
    const inMonth = date.getMonth() === month0 && date.getFullYear() === year

    if (!inMonth) return { key, day, state: 'other', method: null }
    if (!ready || !status) return { key, day, state: 'normal', method: null }

    const record = recordMap.get(key)
    if (record) {
      return { key, day, state: record.is_make_up ? 'make-up' : 'signed', method: null }
    }
    if (key === todayKey) return { key, day, state: 'today', method: null }
    if (key > todayKey) return { key, day, state: 'future', method: null }
    if (Math.round((todayTime - date.getTime()) / DAY_MS) > windowDays) {
      return { key, day, state: 'expired', method: null }
    }

    return { key, day, state: 'missed', method: byPoints ? 'points' : 'card' }
  })
}
