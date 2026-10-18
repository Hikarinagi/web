import { describe, expect, it } from 'vitest'
import { readSpan, readTime } from '~/features/light-novel-reader/end'

describe('readTime', () => {
  it('不足一分钟时写明不足 1 分钟', () => {
    expect(readTime(0)).toBe('不足 1 分钟')
    expect(readTime(59_999)).toBe('不足 1 分钟')
  })

  it('一小时以内只写分钟', () => {
    expect(readTime(12 * 60_000 + 30_000)).toBe('12 分钟')
  })

  it('一小时以上写小时与分，整点省去分', () => {
    expect(readTime((3 * 60 + 12) * 60_000)).toBe('3 小时 12 分')
    expect(readTime(2 * 3_600_000)).toBe('2 小时')
  })
})

describe('readSpan', () => {
  it('按自然日计算历时，起止两天都算在内', () => {
    expect(readSpan(new Date(2026, 9, 7, 23, 50).toISOString(), new Date(2026, 9, 15, 0, 10))).toBe(
      '自 10 月 7 日起，历时 9 天',
    )
  })

  it('当天开始当天读完', () => {
    expect(readSpan(new Date(2026, 9, 18, 8).toISOString(), new Date(2026, 9, 18, 22))).toBe(
      '10 月 18 日开始阅读，当天读完',
    )
  })

  it('跨年时日期带上年份', () => {
    expect(readSpan(new Date(2025, 11, 30).toISOString(), new Date(2026, 0, 2))).toBe(
      '自 2025 年 12 月 30 日起，历时 4 天',
    )
  })
})
