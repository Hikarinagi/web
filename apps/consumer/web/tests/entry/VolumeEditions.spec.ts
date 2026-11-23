import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { components } from '@hikarinagi/api-contract/v3'
import Editions from '../../app/components/entry/VolumeEditions.vue'

type Edition = components['schemas']['VolumeEditionDto']

const edition = (over: Partial<Edition>): Edition => ({
  entry_id: 1,
  title: null,
  format: null,
  part: null,
  isbn: null,
  publishers: [],
  labels: [],
  release_date: null,
  release_date_precision: null,
  release_status: null,
  price: null,
  currency: null,
  tax_included: null,
  page_count: null,
  ...over,
})

describe('EntryVolumeEditions', () => {
  it('lists every edition of the volume with its form, the part a split covers and its details', () => {
    const wrapper = mount(Editions, {
      props: {
        editions: [
          edition({
            entry_id: 1,
            title: 'SLAM DUNK 1',
            format: 'TANKOBON',
            isbn: '9784088716114',
            publishers: [{ id: 2, name: '集英社' }],
            labels: [{ id: null, name: 'ジャンプ・コミックス' }],
            release_date: '1991-02-08T00:00:00.000Z',
            release_date_precision: 'DAY',
            price: 390,
            currency: 'JPY',
            tax_included: true,
            page_count: 200,
          }),
          edition({
            entry_id: 2,
            title: 'SLAM DUNK 分冊版 1',
            format: 'DIGITAL',
            part: 'コミックス1巻1話収録',
            release_date: '2020-01-01T00:00:00.000Z',
            release_date_precision: 'MONTH',
          }),
          edition({ entry_id: 3, title: '灌篮高手 1', format: 'TRANSLATION' }),
        ],
      },
      global: {
        stubs: {
          EntrySectionHead: {
            props: ['title', 'count'],
            template: '<h2>{{ title }} {{ count }}</h2>',
          },
        },
      },
    })
    expect(wrapper.get('h2').text()).toBe('出版版本 3')
    const rows = wrapper.findAll('tbody tr').map(row => row.text())
    expect(rows).toHaveLength(3)
    expect(rows[0]).toContain('SLAM DUNK 1')
    expect(rows[0]).toContain('单行本')
    expect(rows[0]).toContain('集英社、ジャンプ・コミックス')
    expect(rows[0]).toContain('1991 年 2 月 8 日')
    expect(rows[0]).toContain('390 日元（含税）')
    expect(rows[1]).toContain('电子书')
    expect(rows[1]).toContain('所收部分：コミックス1巻1話収録')
    expect(rows[1]).toContain('2020 年 1 月')
    expect(rows[1]).not.toContain('1 日')
    expect(rows[2]).toContain('官方译本')
  })

  it('lists the editions of a light novel volume, bunko and translation alike', () => {
    const wrapper = mount(Editions, {
      props: {
        editions: [
          edition({
            entry_id: 21,
            title: '涼宮ハルヒの憂鬱',
            format: 'BUNKO',
            isbn: '9784044292010',
            labels: [{ id: 3, name: '角川スニーカー文庫' }],
            release_date: '2003-06-10T00:00:00.000Z',
            release_date_precision: 'DAY',
            page_count: 304,
          }),
          edition({ entry_id: 22, title: '凉宫春日的忧郁', format: 'TRANSLATION' }),
        ],
      },
      global: {
        stubs: {
          EntrySectionHead: {
            props: ['title', 'count'],
            template: '<h2>{{ title }} {{ count }}</h2>',
          },
        },
      },
    })
    expect(wrapper.get('h2').text()).toBe('出版版本 2')
    const rows = wrapper.findAll('tbody tr').map(row => row.text())
    expect(rows[0]).toContain('文库本')
    expect(rows[0]).toContain('角川スニーカー文庫')
    expect(rows[0]).toContain('2003 年 6 月 10 日')
    expect(rows[1]).toContain('凉宫春日的忧郁')
    expect(rows[1]).toContain('官方译本')
  })
})
