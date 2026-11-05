import { describe, expect, it } from 'vitest'
import { dateInput, parseDate } from '~/features/wiki/editor/inputs'

describe('parseDate', () => {
  it('reads a year, a month or a day with its precision', () => {
    expect(parseDate('2026')).toEqual({ date: '2026-01-01', precision: 'YEAR' })
    expect(parseDate('2026-10')).toEqual({ date: '2026-10-01', precision: 'MONTH' })
    expect(parseDate('2026/10/4')).toEqual({ date: '2026-10-04', precision: 'DAY' })
    expect(parseDate('2026年10月4日')).toEqual({ date: '2026-10-04', precision: 'DAY' })
  })

  it('keeps what does not read as a date, so the save can point it out', () => {
    expect(parseDate('2026-02-30')).toEqual({ date: '2026-02-30', precision: null })
    expect(parseDate('秋')).toEqual({ date: '秋', precision: null })
    expect(parseDate(' ')).toEqual({ date: null, precision: null })
  })

  it('writes a date back at its precision', () => {
    expect(dateInput('2026-10-01', 'MONTH')).toBe('2026-10')
    expect(dateInput('2026-01-01', 'YEAR')).toBe('2026')
    expect(dateInput('秋', null)).toBe('秋')
  })
})
