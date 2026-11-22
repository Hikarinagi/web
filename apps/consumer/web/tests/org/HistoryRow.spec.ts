import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Row from '../../app/components/org/history/Row.vue'
import type { OrgWork } from '~/features/org/works'

const work = (overrides: Partial<OrgWork> = {}): OrgWork => ({
  kind: 'game',
  id: 447,
  title: '樱之诗',
  original: 'サクラノ詩',
  cover: null,
  date: '2015-10-23',
  roles: ['DEVELOPER'],
  rating: { average: 8.6, count: 120 },
  volumes: null,
  label: null,
  people: [
    { code: 'ORIGINAL_ART', person_id: 1, name: '狗神煌' },
    { code: 'SCENARIO', person_id: 2, name: 'すかぢ' },
  ],
  authors: '',
  ...overrides,
})

const render = (item: OrgWork) =>
  mount(Row, { props: { work: item }, global: { stubs: { HikariImage: true } } })

describe('OrgHistoryRow', () => {
  it('makes the whole card one link to the work', () => {
    const wrapper = render(work())
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/galgames/447')
    expect(wrapper.findAll('a').map(link => link.element)).toEqual([wrapper.element])
    expect(wrapper.text()).toContain('樱之诗')
    expect(wrapper.text()).toContain('すかぢ')
  })

  it('links every medium to its own page', () => {
    expect(render(work({ kind: 'novel', id: 12 })).attributes('href')).toBe('/light-novels/12')
    expect(render(work({ kind: 'manga', id: 3 })).attributes('href')).toBe('/mangas/3')
  })

  it('carries the hina interaction of a clickable surface', () => {
    const wrapper = render(work())
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['hn-interactive', 'hn-state-layer', 'hn-press-lg']),
    )
    expect(wrapper.find(':scope > .hn-ripple').exists()).toBe(true)
    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})
