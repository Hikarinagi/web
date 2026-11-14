import { describe, expect, it } from 'vitest'
import { rowTone } from '../../app/features/entry/tone'
import { badgeOf } from '../../app/features/ranking/logo'
import {
  rangeText,
  rankingBff,
  rankingRoute,
  readRankingQuery,
} from '../../app/features/ranking/ranking'

describe('ranking', () => {
  it('reads the period from the query and defaults to the weekly chart', () => {
    expect(readRankingQuery({ period: 'day' })).toBe('day')
    expect(readRankingQuery({ period: ['month'] })).toBe('month')
    expect(readRankingQuery({ period: 'year' })).toBe('week')
    expect(readRankingQuery({})).toBe('week')
  })

  it('leaves the weekly period out of addresses', () => {
    expect(rankingRoute('mangas', 'week')).toBe('/mangas/ranking')
    expect(rankingRoute('light-novels', 'day')).toBe('/light-novels/ranking?period=day')
    expect(rankingBff('mangas', 'month')).toBe('/api/pages/mangas/ranking?period=month')
  })

  it('writes the counted days with the year, once when both ends share it', () => {
    expect(rangeText('2026-11-13', '2026-11-13')).toBe('2026 年 11 月 13 日')
    expect(rangeText('2026-11-07', '2026-11-13')).toBe('2026 年 11 月 7 日至 11 月 13 日')
    expect(rangeText('2026-12-15', '2027-01-13')).toBe('2026 年 12 月 15 日至 2027 年 1 月 13 日')
  })

  it('lays badge letters out left to right and sizes the plate to the word', () => {
    const daily = badgeOf('DAILY')
    const monthly = badgeOf('MONTHLY')
    expect(daily.letters).toHaveLength(5)
    expect(monthly.width).toBeGreaterThan(daily.width)
    const starts = monthly.letters.map(letter =>
      Number(/translate\(([\d.]+)/.exec(letter.transform)![1]),
    )
    expect([...starts].sort((a, b) => a - b)).toEqual(starts)
  })

  it('tints a row from the cover hash and keeps a cover without colour grey', () => {
    const tone = rowTone('3OcRJYB4d3h/iIeHeEh3eIhw+j3A')
    expect(tone['--row-bg']).toMatch(/^hsl\(\d+ \d+% var\(--row-bg-l\)\)$/)
    expect(Object.keys(tone)).toEqual(['--row-bg', '--row-line', '--row-ink', '--row-soft'])
    expect(rowTone(null)['--row-bg']).toMatch(/^hsl\(\d+ \d+% var\(--row-bg-l\)\)$/)
  })
})
