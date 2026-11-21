import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { GalgamePageData } from '../../server/api/pages/galgames/[id].get'
import Meta from '../../app/components/galgame/stage/Meta.vue'

type Display = 'ORIGINAL' | 'INVERTED' | 'HIDDEN'

function render(light: Display | null, dark: Display = 'ORIGINAL') {
  const data = {
    display: {
      brands: [{ text: 'sprite', producer_id: 31 }],
      release: { text: '2026 年 11 月 26 日' },
      platforms: [],
    },
    galgame: {
      logos: light ? [{ language: null, light, dark, media: { src: 'logo.webp' } }] : [],
      origin_lang: 'ja',
    },
  } as unknown as GalgamePageData
  const wrapper = mount(Meta, {
    props: { data, languages: ['日语'] },
    global: { stubs: { NuxtLink: { template: '<a><slot /></a>' } } },
  })
  const brand = wrapper.findAll('a').find(node => node.text() === 'sprite')
  return {
    texts: wrapper.text(),
    brand: brand ? brand.element.parentElement!.className.split(/\s+/) : null,
  }
}

describe('GalgameStageMeta', () => {
  it('lists the brand among the facts on a theme that shows the title logo', () => {
    const { texts, brand } = render('ORIGINAL', 'INVERTED')
    expect(texts.indexOf('sprite')).toBeLessThan(texts.indexOf('2026 年 11 月 26 日'))
    expect(brand).toEqual(expect.arrayContaining(['flex', 'dark:flex']))
  })

  it('leaves the brand out of the facts where the title is written out', () => {
    expect(render(null).brand).toBeNull()
    expect(render('HIDDEN').brand).toEqual(expect.arrayContaining(['hidden', 'dark:flex']))
    expect(render('ORIGINAL', 'HIDDEN').brand).toEqual(
      expect.arrayContaining(['flex', 'dark:hidden']),
    )
  })
})
