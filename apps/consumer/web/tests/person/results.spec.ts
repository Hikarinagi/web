import { describe, expect, it } from 'vitest'
import {
  defaultPersonTab,
  personListBff,
  personRoute,
  readPersonQuery,
} from '~/features/person/results'
import { roleCounts, workYears } from '~/features/person/works'

const stats = (overrides: Record<string, unknown> = {}) =>
  ({
    works: 3,
    media: { galgame: 2, light_novel: 1, manga: 0 },
    voices: 0,
    roles: [
      { code: 'OTHER', count: 5 },
      { code: 'MUSIC', count: 2 },
    ],
    first_date: '2001-03-01T00:00:00.000Z',
    last_date: '2012-10-26T00:00:00.000Z',
    ...overrides,
  }) as Parameters<typeof roleCounts>[0]

describe('person list state', () => {
  it('reads the tab, the order and the page from the address and ignores junk', () => {
    expect(readPersonQuery({ tab: 'MUSIC', sort: 'old', page: '3' })).toEqual({
      tab: 'MUSIC',
      order: 'old',
      page: 3,
    })
    expect(readPersonQuery({ sort: 'views', page: '-1' })).toEqual({
      tab: null,
      order: 'new',
      page: 1,
    })
  })

  it('leaves defaults out of the address', () => {
    expect(personRoute(9, { tab: null, order: 'new', page: 1 })).toBe('/people/9')
    expect(personRoute(9, { tab: 'MUSIC', order: 'old', page: 2 })).toBe(
      '/people/9?tab=MUSIC&sort=old&page=2',
    )
    expect(personListBff(9, { tab: 'ALL', order: 'new', page: 1 })).toBe(
      '/api/pages/people/9/works?tab=ALL',
    )
  })

  it('opens voices first, then all works when there are several roles', () => {
    expect(defaultPersonTab(stats({ voices: 4 }))).toBe('VOICE')
    expect(defaultPersonTab(stats())).toBe('ALL')
    expect(defaultPersonTab(stats({ roles: [{ code: 'MUSIC', count: 2 }] }))).toBe('MUSIC')
    expect(defaultPersonTab(stats({ roles: [] }))).toBe('ALL')
  })
})

describe('person stats', () => {
  it('puts voices among the roles by count and keeps other roles last', () => {
    expect(roleCounts(stats({ voices: 3 })).map(role => [role.code, role.count])).toEqual([
      ['VOICE', 3],
      ['MUSIC', 2],
      ['OTHER', 5],
    ])
  })

  it('spans the years of the person', () => {
    expect(workYears(stats())).toBe('2001 年至 2012 年')
    expect(workYears(stats({ first_date: null, last_date: null }))).toBeNull()
  })
})
