import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import Info from '../../app/components/landing/galgame/hero/Info.vue'
import Shelf from '../../app/components/landing/galgame/hero/Shelf.vue'

type Pick = ApiData<'/api/v3/landing/galgames', 'get'>['picks'][number]

function pick(id: number, date: string, extra: Partial<Pick> = {}) {
  return {
    id,
    origin_title: `作品${id}`,
    trans_title: null,
    covers: [{ votes: 0, media: { src: `cover-${id}.webp`, width: 600, height: 800 } }],
    nsfw: false,
    release_date: `${date}T00:00:00.000Z`,
    release_date_precision: 'DAY',
    release_date_tbd: false,
    producers: [],
    maker: 'sprite',
    platforms: ['WIN'],
    language: 'ja',
    logos: [],
    ...extra,
  } as unknown as Pick
}

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' },
  HikariImage: { template: '<img />' },
  LandingGalgameHeroMark: { template: '<span />' },
}

describe('LandingGalgameHeroInfo', () => {
  it('counts the days to the release, and the days since it once it is out', () => {
    const text = (date: string) =>
      mount(Info, {
        props: { item: pick(1, date), today: '2026-11-22' },
        global: { stubs },
      }).text()
    expect(text('2026-11-26')).toContain('还有 4 天发售')
    expect(text('2026-11-22')).toContain('今天发售')
    expect(text('2026-11-13')).toContain('已发售 9 天')
  })

  it('writes the title out only on a theme where the title logo is hidden', () => {
    const logo = { language: null, light: 'ORIGINAL', dark: 'HIDDEN', media: { src: 'logo.webp' } }
    const heading = mount(Info, {
      props: { item: pick(1, '2026-11-26', { logos: [logo] } as never), today: '2026-11-22' },
      global: { stubs },
    }).get('h3')
    expect(heading.classes()).toEqual(expect.arrayContaining(['sr-only', 'dark:not-sr-only']))
  })
})

describe('LandingGalgameHeroShelf', () => {
  it('marks today on the shelf and asks for the work under the pointer', async () => {
    const wrapper = mount(Shelf, {
      props: {
        items: [pick(1, '2026-11-22'), pick(2, '2026-11-26')],
        index: 0,
        today: '2026-11-22',
        cycling: false,
        paused: false,
      },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('今天')
    expect(wrapper.text()).toContain('11 月 26 日')
    await wrapper.findAll('a')[1]!.trigger('mouseenter')
    expect(wrapper.emitted('select')).toEqual([[1]])
  })
})
