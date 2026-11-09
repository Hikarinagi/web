import { describe, expect, it } from 'vitest'
import { orgListBff, orgRoute, readOrgQuery } from '~/features/org/results'
import { groupQuery, orgGroups, orgMode, yearBuckets } from '~/features/org/works'

const stats = (overrides: Record<string, unknown> = {}) =>
  ({
    works: 4,
    media: { galgame: 2, light_novel: 1, manga: 1 },
    groups: [
      { kind: 'galgame', code: 'DEVELOPER', count: 2 },
      { kind: 'light_novel', code: null, count: 1 },
    ],
    codes: [],
    years: [
      { kind: 'galgame', code: 'DEVELOPER', year: 2010, count: 1 },
      { kind: 'light_novel', code: null, year: 2010, count: 2 },
      { kind: 'light_novel', code: null, year: 2012, count: 1 },
    ],
    first_date: null,
    last_date: null,
    rating: { average: null, count: 0 },
    ...overrides,
  }) as Parameters<typeof orgMode>[1]

describe('orgMode', () => {
  it('follows the organization type first', () => {
    expect(orgMode('LABEL', stats())).toBe('shelf')
    expect(orgMode('MAGAZINE', stats())).toBe('serials')
    expect(orgMode('BRAND', stats())).toBe('history')
  })

  it('falls back on what the organization made', () => {
    const books = { groups: [{ kind: 'manga', code: null, count: 3 }] }
    expect(orgMode('COMPANY', stats(books))).toBe('hub')
    expect(orgMode(null, stats())).toBe('history')
    expect(
      orgMode(null, stats({ ...books, codes: [{ kind: 'manga', code: 'MAGAZINE', count: 3 }] })),
    ).toBe('serials')
    expect(orgMode(null, stats({ groups: [], codes: [] }))).toBe('history')
  })
})

describe('org groups', () => {
  it('names game groups by role and book groups by medium, and maps them back to a query', () => {
    const groups = orgGroups(stats(), code => `role:${code}`)
    expect(groups).toEqual([
      { code: 'game:DEVELOPER', label: 'role:DEVELOPER', count: 2 },
      { code: 'novel', label: '轻小说', count: 1 },
    ])
    expect(groupQuery('game:DEVELOPER')).toEqual({ kind: 'galgame', code: 'DEVELOPER' })
    expect(groupQuery('novel')).toEqual({ kind: 'light_novel' })
    expect(groupQuery('ALL')).toEqual({})
  })

  it('sums the years of the chosen group', () => {
    expect(yearBuckets(stats(), 'novel')).toEqual([
      { year: 2010, count: 2 },
      { year: 2012, count: 1 },
    ])
    expect(yearBuckets(stats(), 'ALL')[0]).toEqual({ year: 2010, count: 3 })
  })
})

describe('org list state', () => {
  it('reads the address with defaults and leaves them out when writing it back', () => {
    const state = readOrgQuery({ year: '2010', status: 'COMPLETED', media: 'book' })
    expect(state).toEqual({
      tab: 'ALL',
      sort: 'new',
      year: 2010,
      media: null,
      status: 'COMPLETED',
      page: 1,
    })
    expect(orgRoute(5, state)).toBe('/producers/5?year=2010&status=COMPLETED')
    expect(orgListBff(5, 'shelf', { ...state, year: null, status: 'ALL' })).toBe(
      '/api/pages/producers/5/works?mode=shelf',
    )
  })
})
