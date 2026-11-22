import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import List from '../../app/components/person/works/List.vue'
import type { PersonWork } from '~/features/person/works'

const work = (overrides: Partial<PersonWork>): PersonWork => ({
  kind: 'game',
  id: 1,
  title: '樱之诗',
  original: 'サクラノ詩',
  cover: null,
  date: '2015-10-23',
  by: '枕',
  roles: ['DIRECTOR', 'SCENARIO'],
  rating: { average: 8.6, count: 120 },
  ...overrides,
})

const works = [
  work({ id: 447 }),
  work({
    kind: 'novel',
    id: 12,
    title: '另一部',
    date: '2015-03-01',
    rating: { average: null, count: 0 },
  }),
  work({ kind: 'manga', id: 3, title: '更早的', date: '2010-01-01', by: null }),
]

const render = () => mount(List, { props: { works }, global: { stubs: { HikariImage: true } } })

describe('PersonWorksList', () => {
  it('makes every row one link to its work', () => {
    const rows = render().findAll('a')
    expect(rows.map(row => row.attributes('href'))).toEqual([
      '/galgames/447',
      '/light-novels/12',
      '/mangas/3',
    ])
    expect(rows[0]!.text()).toContain('樱之诗')
    expect(rows[0]!.text()).toContain('枕')
  })

  it('carries the hina interaction and nests no other control in a row', () => {
    for (const row of render().findAll('a')) {
      expect(row.classes()).toEqual(
        expect.arrayContaining(['hn-interactive', 'hn-state-layer', 'hn-press-lg']),
      )
      expect(row.find(':scope > .hn-ripple').exists()).toBe(true)
      expect(row.findAll('a, button')).toHaveLength(0)
    }
  })

  it('still groups the rows by year', () => {
    const text = render().text()
    expect(text.indexOf('2015')).toBeLessThan(text.indexOf('樱之诗'))
    expect(text.indexOf('2010')).toBeGreaterThan(text.indexOf('另一部'))
  })
})
