import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Appearances from '../../app/components/character/Appearances.vue'
import type { CharacterPageData } from '~~/server/api/pages/characters/[id].get'
import type { Appearance } from '~/features/character/appearances'

const appearance = (id: number, date: string): Appearance =>
  ({
    key: `galgame:${id}`,
    kind: 'galgame',
    id,
    title: `game${id}`,
    path: `/galgames/${id}`,
    cover: null,
    date,
    label: null,
    group: null,
    cast_role: null,
    protagonist: false,
    capturable: true,
    image: null,
    intro: null,
    trans_intro: null,
    profile: {},
    voices: [{ text: '北都 南', person_id: 1 }],
  }) as unknown as Appearance

const appearances = [appearance(447, '2014-01-01'), appearance(448, '2015-01-01')]
const character = { name: '芳乃 さくら' } as CharacterPageData['character']

const render = (selected = 'galgame:448') =>
  mount(Appearances, {
    props: { character, appearances, selected },
    global: { stubs: { HikariImage: true, EntrySectionHead: true } },
  })

const rowOf = (wrapper: ReturnType<typeof render>, key: string) =>
  wrapper.get(`a[href="/galgames/${key.split(':')[1]}"]`)

describe('CharacterAppearances', () => {
  it('makes every appearance one link to its work, with the voices as plain text', () => {
    const wrapper = render()
    expect(wrapper.findAll('a').map(link => link.attributes('href'))).toEqual([
      '/galgames/447',
      '/galgames/448',
    ])
    expect(rowOf(wrapper, 'galgame:447').text()).toContain('北都 南')
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

  it('rings the selected appearance like a focus ring instead of filling it', () => {
    const wrapper = render()
    const selected = rowOf(wrapper, 'galgame:448')
    const other = rowOf(wrapper, 'galgame:447')
    expect(selected.attributes('aria-current')).toBe('true')
    expect(selected.classes()).toEqual(
      expect.arrayContaining([
        'outline-solid',
        'outline-(length:--hn-focus-ring-width)',
        'outline-offset-(--hn-focus-ring-offset)',
        'outline-(--hn-focus-ring)',
      ]),
    )
    expect(selected.classes().filter(name => name.startsWith('bg-'))).toEqual([])
    expect(other.attributes('aria-current')).toBeUndefined()
    expect(other.classes()).toContain('outline-transparent')
    expect(other.classes()).not.toContain('outline-(--hn-focus-ring)')
  })

  it('moves the ring with the selection', async () => {
    const wrapper = render()
    await wrapper.setProps({ selected: 'galgame:447' })
    expect(rowOf(wrapper, 'galgame:447').classes()).toContain('outline-(--hn-focus-ring)')
    expect(rowOf(wrapper, 'galgame:448').classes()).toContain('outline-transparent')
  })

  it('offers to switch only to the appearances not shown, outside the link', async () => {
    const wrapper = render()
    const buttons = wrapper.findAll('button[aria-label="切换至此作品"]')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]!.element.closest('a')).toBeNull()
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('show')).toEqual([['galgame:447']])
  })
})
