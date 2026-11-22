import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import Slide from '../../app/components/landing/galgame/hero/Slide.vue'
import Custom from '../../app/components/landing/galgame/hero/slide/Custom.vue'
import Work from '../../app/components/landing/galgame/hero/slide/Work.vue'
import Tabs from '../../app/components/landing/galgame/hero/Tabs.vue'

type Slide = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]
type SlideWork = NonNullable<Slide['work']>

const logo = { language: null, light: 'ORIGINAL', dark: 'INVERTED', media: { src: 'logo.webp' } }

function work(id: number, date: string, extra: Partial<SlideWork> = {}) {
  return {
    id,
    origin_title: `作品${id}`,
    trans_title: `中文${id}`,
    covers: [{ votes: 0, media: { src: `cover-${id}.webp`, width: 600, height: 800 } }],
    nsfw: false,
    release_date: `${date}T00:00:00.000Z`,
    release_date_precision: 'DAY',
    producers: [],
    maker: 'sprite',
    platforms: ['WIN'],
    language: 'ja',
    logos: [logo],
    price: '8800',
    genre: '恋爱ADV',
    ...extra,
  } as unknown as SlideWork
}

function slide(id: number, extra: Partial<Slide> = {}) {
  return {
    id,
    is_ad: false,
    banner: { id: id * 10, src: `banner-${id}.webp`, width: 1920, height: 1080, thumb_hash: null },
    description: '简介',
    work: work(id, '2026-11-26'),
    title: null,
    logo: null,
    action_label: null,
    link: null,
    open_in_new: false,
    ...extra,
  } as Slide
}

const stubs = {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  HikariImage: { template: '<img />' },
  LandingGalgameHeroMark: { template: '<span />' },
  LandingGalgameHeroSlideWork: Work,
  LandingGalgameHeroSlideCustom: Custom,
  ScrollRail: { template: '<div><slot /></div>' },
}
const directives = { tooltip: {} }

function mountWork(date: string, extra: Partial<SlideWork> = {}) {
  return mount(Work, {
    props: { item: work(1, date, extra), description: '简介', today: '2026-11-22' },
    global: { stubs, directives },
  })
}

describe('LandingGalgameHeroSlideWork', () => {
  it('counts the days to the release and drops the count once it is out', () => {
    expect(mountWork('2026-11-26').text()).toContain('还有 4 天')
    expect(mountWork('2026-11-22').text()).toContain('今天发售')
    expect(mountWork('2026-11-13').text()).not.toContain('还有')
  })

  it('lists the brand, release date and platforms below the logo, with nothing above it', () => {
    const wrapper = mountWork('2026-11-26')
    const text = wrapper.text()
    expect(text).toContain('sprite')
    expect(text).toContain('11 月 26 日发售')
    expect(text.indexOf('中文1')).toBeLessThan(text.indexOf('sprite'))
    expect(wrapper.get('h3').classes()).toContain('sr-only')
  })

  it('writes the title out on the theme where the logo is hidden', () => {
    const wrapper = mountWork('2026-11-26', { logos: [{ ...logo, dark: 'HIDDEN' }] } as never)
    expect(wrapper.get('h3').classes()).toEqual(
      expect.arrayContaining(['sr-only', 'dark:not-sr-only']),
    )
    expect(wrapper.text()).toContain('作品1')
  })
})

describe('LandingGalgameHeroSlide', () => {
  it('shows a custom slide with its title, text and button, and marks an advertisement', () => {
    const wrapper = mount(Slide, {
      props: {
        item: slide(2, {
          work: null,
          title: '夏日活动',
          description: '八月一日开始',
          link: '/events/summer',
          is_ad: true,
        }),
        today: '2026-11-22',
        active: true,
      },
      global: { stubs, directives },
    })
    const text = wrapper.text()
    expect(text).toContain('夏日活动')
    expect(text).toContain('八月一日开始')
    expect(text).toContain('了解详情')
    expect(text).toContain('广告')
    expect(wrapper.find('a[href="/events/summer"]').exists()).toBe(true)
  })

  it('leaves the advertisement mark off an ordinary slide', () => {
    const wrapper = mount(Slide, {
      props: { item: slide(1), today: '2026-11-22', active: true },
      global: { stubs, directives },
    })
    expect(wrapper.text()).not.toContain('广告')
    expect(wrapper.find('a[href="/galgames/1"]').exists()).toBe(true)
  })
})

describe('LandingGalgameHeroTabs', () => {
  it('switches to the slide whose banner is clicked', async () => {
    const wrapper = mount(Tabs, {
      props: {
        items: [slide(1), slide(2, { work: null, title: '活动' })],
        selected: 0,
        cycling: false,
        paused: false,
      },
      global: { stubs, directives },
    })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[1]])
  })
})
