import { describe, expect, it } from 'vitest'
import { calendarDays, monthLength, shiftMonth } from '../../app/features/galgame/calendar'

const item = (id: number, date: string | null, precision: 'DAY' | 'MONTH' = 'DAY') => ({
  id,
  release_date: date,
  release_date_precision: precision,
})

describe('galgame calendar', () => {
  it('groups works by release day and keeps the order they arrive in', () => {
    const days = calendarDays([
      item(1, '2026-10-22T00:00:00.000Z'),
      item(2, '2026-10-30T00:00:00.000Z'),
      item(3, '2026-10-30T00:00:00.000Z'),
    ])
    expect(days.map(day => [day.date, day.list.map(row => row.id)])).toEqual([
      ['2026-10-22', [1]],
      ['2026-10-30', [2, 3]],
    ])
  })

  it('gathers works dated only to the month under an empty date', () => {
    const days = calendarDays([
      item(1, '2026-10-22T00:00:00.000Z'),
      item(2, '2026-10-01T00:00:00.000Z', 'MONTH'),
      item(3, null),
    ])
    expect(days.map(day => [day.date, day.list.map(row => row.id)])).toEqual([
      ['2026-10-22', [1]],
      ['', [2, 3]],
    ])
  })

  it('counts the days of a month, leap years included', () => {
    expect(monthLength('2026-10')).toBe(31)
    expect(monthLength('2026-02')).toBe(28)
    expect(monthLength('2028-02')).toBe(29)
  })

  it('steps across a year boundary', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })
})
