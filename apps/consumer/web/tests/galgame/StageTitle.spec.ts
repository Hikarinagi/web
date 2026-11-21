import { Heading } from '@hina-ui/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import type { GalgamePageData } from '../../server/api/pages/galgames/[id].get'
import Title from '../../app/components/galgame/stage/Title.vue'

const HikariImageStub = defineComponent({
  name: 'HikariImage',
  props: ['src', 'alt'],
  setup(props) {
    return () => h('img', { src: (props.src as { src: string }).src, alt: props.alt })
  },
})

type Display = 'ORIGINAL' | 'INVERTED' | 'HIDDEN'

const logoOf = (language: string | null, light: Display, dark: Display) => ({
  language,
  light,
  dark,
  media: {
    id: 1,
    src: `logo-${language ?? 'original'}.webp`,
    width: 751,
    height: 390,
    thumb_hash: null,
    nsfw: false,
    sexual: 0,
    violence: 0,
  },
})

function render(logos: ReturnType<typeof logoOf>[], title = '转生魔王大人赢不了勇者') {
  const data = {
    display: {
      title,
      original_title: '転生魔王さまは勇者に勝てない！2',
      brands: [{ text: 'くまのみソフト', producer_id: null }],
    },
    galgame: { logos, origin_lang: 'ja', en_title: null },
  } as unknown as GalgamePageData
  const wrapper = mount(Title, {
    props: { data, title },
    global: { stubs: { HikariImage: HikariImageStub } },
  })
  const image = wrapper.find('img')
  return {
    logo: image.exists() ? { src: image.attributes('src'), classes: image.classes() } : null,
    heading: wrapper.findComponent(Heading).classes(),
    brand: wrapper
      .findAll('p, span')
      .find(node => node.text() === 'くまのみソフト')!
      .classes(),
    subtitle: wrapper
      .findAll('p, span')
      .find(node => node.text().startsWith('転生'))!
      .classes(),
  }
}

describe('GalgameStageTitle', () => {
  it('shows the written title when the game has no title logo', () => {
    const { logo, heading, subtitle, brand } = render([])
    expect(logo).toBeNull()
    expect(heading).toEqual(expect.arrayContaining(['text-4xl', 'lg:text-6xl']))
    expect(subtitle).not.toContain('sr-only')
    expect(brand).not.toEqual(expect.arrayContaining(['hidden']))
    expect(brand).not.toEqual(expect.arrayContaining(['dark:hidden']))
  })

  it('leaves the brand above the title only on a theme that shows no logo', () => {
    expect(render([logoOf(null, 'ORIGINAL', 'ORIGINAL')]).brand).toEqual(
      expect.arrayContaining(['hidden', 'dark:hidden']),
    )
    const lightOnly = render([logoOf(null, 'ORIGINAL', 'HIDDEN')]).brand
    expect(lightOnly).toEqual(expect.arrayContaining(['hidden', 'dark:block']))
    const darkOnly = render([logoOf(null, 'HIDDEN', 'ORIGINAL')]).brand
    expect(darkOnly).toContain('dark:hidden')
    expect(darkOnly).not.toContain('hidden')
  })

  it('takes the simplified Chinese logo first and shows it on each theme as set', () => {
    const { logo, heading } = render([
      logoOf(null, 'ORIGINAL', 'ORIGINAL'),
      logoOf('zh-Hans', 'ORIGINAL', 'INVERTED'),
    ])
    expect(logo!.src).toBe('logo-zh-Hans.webp')
    expect(logo!.classes).toEqual(
      expect.arrayContaining(['block', 'dark:invert', 'dark:hue-rotate-180']),
    )
    expect(logo!.classes).not.toContain('invert')
    expect(heading).toEqual(expect.arrayContaining(['sr-only', 'dark:sr-only']))
  })

  it('keeps the written title where the logo is hidden and beside it where the logo is not Chinese', () => {
    const { logo, heading, subtitle } = render([logoOf(null, 'HIDDEN', 'ORIGINAL')])
    expect(logo!.src).toBe('logo-original.webp')
    expect(logo!.classes).toEqual(expect.arrayContaining(['hidden', 'dark:block']))
    expect(heading).toEqual(
      expect.arrayContaining(['text-4xl', 'lg:text-6xl', 'dark:text-xl', 'dark:lg:text-3xl']),
    )
    expect(subtitle).toEqual(expect.arrayContaining(['dark:sr-only']))
    expect(subtitle).not.toContain('sr-only')
  })

  it('passes over a logo hidden on both themes', () => {
    const { logo } = render([
      logoOf('zh-Hans', 'HIDDEN', 'HIDDEN'),
      logoOf(null, 'INVERTED', 'ORIGINAL'),
    ])
    expect(logo!.src).toBe('logo-original.webp')
    expect(logo!.classes).toEqual(expect.arrayContaining(['invert', 'hue-rotate-180']))
    expect(render([logoOf(null, 'HIDDEN', 'HIDDEN')]).logo).toBeNull()
  })
})
