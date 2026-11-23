import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SeriesStrip from '../../app/components/light-novel-volume/SeriesStrip.vue'
import { NuxtLink } from '../stubs/components'
import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

type Volume = LightNovelVolumePageData['volumes'][number]

const reissue = { id: 61, name: '新装版', original: false }
const volume = (id: number, number: number) =>
  ({
    id,
    volume_label: String(number),
    volume_number: number,
    display_cover: null,
    publication_date: '2020-01-01T00:00:00.000Z',
    volume_set: reissue,
  }) as Volume

const stubs = {
  NuxtLink,
  EntryBookCover: { props: ['alt'], template: '<img :alt="alt" />' },
  EntrySectionHead: {
    props: ['title', 'count'],
    template: '<header><h2>{{ title }} {{ count }}</h2><slot name="actions" /></header>',
  },
}

describe('LightNovelVolumeSeriesStrip', () => {
  it('names the set beside the volumes of the same set and leaves it out of each volume', () => {
    const wrapper = mount(SeriesStrip, {
      props: { volumes: [volume(11, 1), volume(12, 2)], current: 12, set: '新装版' },
      global: { stubs },
    })
    expect(wrapper.get('header').text()).toBe('同系列 2新装版')
    const links = wrapper.findAll('a')
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/light-novel-volumes/11',
      '/light-novel-volumes/12',
    ])
    expect(links[1]!.attributes('aria-current')).toBe('page')
    expect(links[0]!.text()).toContain('第 1 卷')
    expect(links[0]!.text()).not.toContain('新装版')
  })

  it('shows no set name when the work has one set', () => {
    const wrapper = mount(SeriesStrip, {
      props: { volumes: [volume(11, 1)], current: 11, set: null },
      global: { stubs },
    })
    expect(wrapper.get('header').text()).toBe('同系列 1')
  })
})
