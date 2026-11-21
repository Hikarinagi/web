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

const media = (src: string) => ({
  id: 1,
  src,
  width: 751,
  height: 390,
  thumb_hash: null,
  nsfw: false,
  sexual: 0,
  violence: 0,
})

function render(
  logos: { language: string | null; media: ReturnType<typeof media> }[],
  title = '转生魔王大人赢不了勇者',
) {
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
  const subtitle = wrapper.findAll('p, span').find(node => node.text().startsWith('転生'))
  return {
    logo: wrapper.find('img').exists() ? wrapper.find('img').attributes('src') : null,
    heading: wrapper.findComponent(Heading),
    subtitle,
  }
}

describe('GalgameStageTitle', () => {
  it('shows the written title as the heading when the game has no title logo', () => {
    const { logo, heading, subtitle } = render([])
    expect(logo).toBeNull()
    expect(heading.text()).toBe('转生魔王大人赢不了勇者')
    expect(heading.classes()).not.toContain('sr-only')
    expect(subtitle!.classes()).not.toContain('sr-only')
  })

  it('takes the logo of the reader language first and keeps its words only for readers', () => {
    const { logo, heading, subtitle } = render([
      { language: null, media: media('images/ja.webp') },
      { language: 'zh-Hans', media: media('images/zh.webp') },
    ])
    expect(logo).toBe('images/zh.webp')
    expect(heading.text()).toBe('转生魔王大人赢不了勇者')
    expect(heading.classes()).toContain('sr-only')
    expect(subtitle!.classes()).not.toContain('sr-only')
  })

  it('falls back to the logo of the original language and keeps the Chinese title in sight', () => {
    const { logo, heading, subtitle } = render([
      { language: 'en', media: media('images/en.webp') },
      { language: null, media: media('images/ja.webp') },
    ])
    expect(logo).toBe('images/ja.webp')
    expect(heading.classes()).not.toContain('sr-only')
    expect(subtitle!.classes()).toContain('sr-only')
  })

  it('shows no logo when there is none in the reader or the original language', () => {
    const { logo, heading } = render([{ language: 'en', media: media('images/en.webp') }])
    expect(logo).toBeNull()
    expect(heading.classes()).not.toContain('sr-only')
  })
})
