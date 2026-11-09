import { describe, expect, it } from 'vitest'
import {
  chapterLabel,
  dayLabel,
  reasonLabel,
  relativeDay,
  volumeLabel,
  weekdayLabel,
  yenLabel,
} from '../../app/features/landing/labels'
import { groupByDay } from '../../app/features/landing/stage'

describe('landing labels', () => {
  it('writes dates, weekdays and days relative to today', () => {
    expect(dayLabel('2026-11-09')).toBe('11 月 9 日')
    expect(weekdayLabel('2026-11-09')).toBe('周一')
    expect(relativeDay('2026-11-09', '2026-11-09')).toBe('今天')
    expect(relativeDay('2026-11-08', '2026-11-09')).toBe('昨天')
    expect(relativeDay('2026-11-05', '2026-11-09')).toBe('11 月 5 日')
  })

  it('names a chapter by its number, title or kind', () => {
    const chapter = (type: string, number: string | null, title: string | null = null) => ({
      type,
      number,
      title,
    })
    expect(chapterLabel(chapter('serialization', '012'))).toBe('第 12 话')
    expect(chapterLabel(chapter('SERIALIZATION', '38.2'))).toBe('第 38.2 话')
    expect(chapterLabel(chapter('serialization', '前編'))).toBe('前編')
    expect(chapterLabel(chapter('extra', null, '06卷附録'))).toBe('06卷附録')
    expect(chapterLabel(chapter('volume', '3'))).toBe('第 3 卷')
    expect(chapterLabel(chapter('extra', null))).toBe('番外')
    expect(chapterLabel(null)).toBe('')
  })

  it('names a volume by its number or title and prices in yen', () => {
    expect(volumeLabel({ number: '4', title: '第四卷' })).toBe('第 4 卷')
    expect(volumeLabel({ number: '上', title: null })).toBe('上')
    expect(volumeLabel({ number: null, title: '短編集' })).toBe('短編集')
    expect(yenLabel('8800')).toBe('8,800 日元')
  })

  it('explains each recommendation in the words of its source', () => {
    const similar = { kind: 'SIMILAR' as const, ref: { id: 1, title: '千恋＊万花' } }
    expect(reasonLabel(similar, 'galgame')).toBe('与《千恋＊万花》相似')
    expect(reasonLabel({ kind: 'HOT', ref: null }, 'manga')).toBe('本周热门')
    expect(reasonLabel({ kind: 'ACCLAIMED', ref: null }, 'galgame')).toBe('高分作品')
    expect(reasonLabel({ kind: 'ACCLAIMED', ref: null }, 'light_novel')).toBe('已完结，全卷可读')
    expect(reasonLabel({ kind: 'ACCLAIMED', ref: null }, 'manga')).toBe('热门完结作品')
  })

  it('groups works by day in date order and marks the days before today', () => {
    const days = groupByDay(
      [
        { id: 1, date: '2026-11-12' },
        { id: 2, date: '2026-11-01' },
        { id: 3, date: '2026-11-12' },
        { id: 4, date: null },
        { id: 5, date: '2026-11-09' },
      ],
      item => item.date,
      '2026-11-09',
    )

    expect(days.map(day => [day.date, day.past, day.items.map(item => item.id)])).toEqual([
      ['2026-11-01', true, [2]],
      ['2026-11-09', false, [5]],
      ['2026-11-12', false, [1, 3]],
    ])
  })
})
