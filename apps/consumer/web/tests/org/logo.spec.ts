import { Center, Image } from '@hina-ui/vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
import Header from '../../app/components/org/Header.vue'
import LightNovelMasthead from '../../app/components/light-novel/catalog/Masthead.vue'
import MangaMasthead from '../../app/components/manga/catalog/Masthead.vue'
import HikariImage from '../../app/components/ui/HikariImage.vue'
import { logoRatio } from '../../app/features/org/logo'

type Logo = { width: number | null; height: number | null }

const WIDE = { width: 1200, height: 400 }
const SQUARE = { width: 300, height: 300 }
const BARE = { width: null, height: null }

const global = {
  components: { HikariImage },
  stubs: { ShareButton: { template: '<span />' } },
}

function media(size: Logo) {
  return { id: 1, src: 'media/logo.webp', thumb_hash: null, ...size }
}

function processed(wrapper: ReturnType<typeof mount>) {
  const image = wrapper.getComponent(Image)
  const url = new URL(image.props('src') as string)
  return {
    fit: url.searchParams.get('fit'),
    width: url.searchParams.get('w'),
    height: url.searchParams.get('h'),
    contain: image.props('fit'),
  }
}

function header(size: Logo) {
  return mount(Header, {
    props: {
      producer: {
        id: 7,
        name: 'はちみつそふと',
        logo: media(size),
        intro: null,
        trans_intro: null,
        website: null,
      } as unknown as ProducerPageData['producer'],
      newest: null,
      score: null,
      kind: '',
      groups: [],
    },
    global,
  })
}

function frame(wrapper: ReturnType<typeof mount>) {
  return wrapper.getComponent(Center).attributes('style')
}

describe('logoRatio', () => {
  it('follows the logo, between a square and a wide limit', () => {
    expect(logoRatio({ width: 400, height: 200 })).toBe(2)
    expect(logoRatio(WIDE)).toBe(2.4)
    expect(logoRatio(SQUARE)).toBe(1)
    expect(logoRatio({ width: 200, height: 400 })).toBe(1)
  })

  it('falls back to the loaded size, then to a square', () => {
    expect(logoRatio(BARE, { width: 400, height: 200 })).toBe(2)
    expect(logoRatio(BARE, null)).toBe(1)
    expect(logoRatio(null)).toBe(1)
  })
})

describe('organization logo', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { cdnHost: 'https://cdn.example.com', imageProcessorHost: 'https://img.example.com' },
    }))
    vi.stubGlobal('useNsfwPolicy', () => ({ limitOf: () => 'JUST_SHOW' }))
    vi.stubGlobal('useNsfwReveal', () => ({ revealed: ref([]) }))
    vi.stubGlobal('useHead', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('frames a wide logo wide in the header and asks for it whole', () => {
    const wrapper = header({ width: 400, height: 200 })
    expect(frame(wrapper)).toContain('aspect-ratio: 2')
    expect(processed(wrapper)).toEqual({
      fit: 'scale-down',
      width: '480',
      height: '192',
      contain: 'contain',
    })
  })

  it('keeps a square logo square in the header and asks for it whole', () => {
    const wrapper = header(SQUARE)
    expect(frame(wrapper)).toContain('aspect-ratio: 1')
    expect(processed(wrapper).fit).toBe('scale-down')
    expect(processed(wrapper).contain).toBe('contain')
  })

  it('asks for a logo without a size whole and frames it once it loads', async () => {
    const wrapper = header(BARE)
    expect(frame(wrapper)).toContain('aspect-ratio: 1')
    expect(processed(wrapper).fit).toBe('scale-down')
    expect(processed(wrapper).contain).toBe('contain')

    wrapper.getComponent(Image).vm.$emit('load', { width: 600, height: 300 })
    await nextTick()
    expect(frame(wrapper)).toContain('aspect-ratio: 2')
  })

  it.each([
    ['light novel', LightNovelMasthead],
    ['manga', MangaMasthead],
  ])('shows the logo whole in the %s catalog masthead', async (_, Masthead) => {
    const render = (size: Logo) =>
      mount(Masthead, {
        props: {
          masthead: {
            eyebrow: '文库',
            name: '電撃文庫',
            sub: null,
            image: media(size),
            shape: 'square',
            meta: [],
            website: null,
          },
          total: 3,
        },
        global,
      })

    for (const [size, ratio] of [
      [WIDE, 2.4],
      [SQUARE, 1],
      [BARE, 1],
    ] as const) {
      const wrapper = render(size)
      expect(wrapper.getComponent(Image).props('ratio')).toBe(ratio)
      expect(processed(wrapper).fit).toBe('scale-down')
      expect(processed(wrapper).contain).toBe('contain')
    }

    const bare = render(BARE)
    bare.getComponent(Image).vm.$emit('load', { width: 300, height: 100 })
    await nextTick()
    expect(bare.getComponent(Image).props('ratio')).toBe(2.4)
  })
})
