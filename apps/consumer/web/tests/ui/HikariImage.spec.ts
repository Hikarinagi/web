import { Image } from '@hina-ui/vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HikariImage from '../../app/components/ui/HikariImage.vue'
import type {
  ContentLimit,
  ContentLimits,
  HikariImageSafety,
  HikariImageSource,
} from '../../app/utils/media/image'
import { imageLimit } from '../../app/utils/media/image'

const HASH = '3OcRJYB4d3h/iIeHeEh3eIhw+j3A'
const LIMITS: Record<'show' | 'blur' | 'block', ContentLimit> = {
  show: 'JUST_SHOW',
  blur: 'SHOW_WITH_SPOILER',
  block: 'NEVER_SHOW_NSFW_CONTENT',
}

describe('HikariImage', () => {
  let limit: 'show' | 'blur' | 'block'
  let violence: ContentLimit | undefined
  const revealed = ref<string[]>([])

  beforeEach(() => {
    limit = 'show'
    violence = undefined
    revealed.value = []
    vi.stubGlobal('useNsfwReveal', () => ({ revealed }))
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { cdnHost: 'https://cdn.example.com', imageProcessorHost: 'https://img.example.com' },
    }))
    vi.stubGlobal('useNsfwPolicy', () => ({
      limitOf: (safety: HikariImageSafety) => {
        const sexual = LIMITS[limit]
        const limits: ContentLimits = {
          sexual_1_limit: sexual,
          sexual_2_limit: sexual,
          violence_1_limit: violence ?? sexual,
          violence_2_limit: violence ?? sexual,
        }
        return imageLimit(safety, limits)
      },
    }))
    vi.stubGlobal('useHead', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function render(src: HikariImageSource) {
    return mount(HikariImage, { props: { src } }).getComponent(Image).props()
  }

  it('hands the thumb hash to Image for an ordinary image', () => {
    const props = render({ src: 'media/a.webp', thumb_hash: HASH })
    expect(props.thumbhash).toBe(HASH)
    expect(props.src).toContain('media/a.webp')
  })

  it('reads the thumb hash from a relation media', () => {
    expect(render({ media: { src: 'media/a.webp', thumb_hash: HASH } }).thumbhash).toBe(HASH)
  })

  it('shows only the thumb hash for a blurred image that has one', () => {
    limit = 'blur'
    const props = render({ src: 'media/a.webp', thumb_hash: HASH, sexual: 2 })
    expect(props.src).toMatch(/^data:image\/png;base64,/)
    expect(props.thumbhash).toBeUndefined()
    expect(props.lazy).toBe(false)
  })

  it('shows the real image once the reader reveals it', () => {
    limit = 'blur'
    revealed.value = ['media/a.webp']
    const props = render({ src: 'media/a.webp', thumb_hash: HASH, sexual: 2 })
    expect(props.src).toContain('media/a.webp')
    expect(props.src).not.toMatch(/^data:image/)
    expect(props.thumbhash).toBe(HASH)
  })

  it('keeps blurring images the reader has not revealed', () => {
    limit = 'blur'
    revealed.value = ['media/other.webp']
    const props = render({ src: 'media/a.webp', thumb_hash: HASH, sexual: 2 })
    expect(props.src).toMatch(/^data:image\/png;base64,/)
  })

  it('shows the thumb hash for a blurred outside link the processor cannot blur', () => {
    limit = 'blur'
    const props = render({ src: 'https://example.org/a.webp', thumb_hash: HASH, sexual: 2 })
    expect(props.src).toMatch(/^data:image\/png;base64,/)
  })

  it('falls back to the processor blur when a blurred image has no thumb hash', () => {
    limit = 'blur'
    const props = render({ src: 'media/a.webp', sexual: 2 })
    expect(props.src).toContain('img.example.com')
    expect(props.src).toContain('blur')
    expect(props.thumbhash).toBeUndefined()
    expect(props.lazy).toBe(true)
  })

  it('blurs an image that has not been rated yet', () => {
    limit = 'blur'
    const props = render({ src: 'media/a.webp', thumb_hash: HASH, sexual: null, violence: null })
    expect(props.src).toMatch(/^data:image\/png;base64,/)
    expect(render({ src: 'media/b.webp', sexual: 0, violence: 0 }).src).toContain('media/b.webp')
  })

  it('shows only the thumb hash to a viewer who may not reveal the image', () => {
    limit = 'block'
    revealed.value = ['media/a.webp']
    const props = render({ src: 'media/a.webp', thumb_hash: HASH, sexual: 2 })
    expect(props.src).toMatch(/^data:image\/png;base64,/)
    expect(props.thumbhash).toBeUndefined()
  })

  it('shows a violent image by the violence setting while adult images stay blurred', () => {
    limit = 'blur'
    violence = 'JUST_SHOW'
    expect(render({ src: 'media/a.webp', thumb_hash: HASH, violence: 2 }).src).toContain(
      'media/a.webp',
    )
    expect(render({ src: 'media/b.webp', thumb_hash: HASH, sexual: 1 }).src).toMatch(
      /^data:image\/png;base64,/,
    )
  })

  it('hides a violent image from a viewer who never shows it, even once revealed', () => {
    violence = 'NEVER_SHOW_NSFW_CONTENT'
    revealed.value = ['media/a.webp']
    expect(render({ src: 'media/a.webp', thumb_hash: HASH, violence: 1 }).src).toMatch(
      /^data:image\/png;base64,/,
    )
    expect(render({ src: 'media/b.webp', thumb_hash: HASH, sexual: 2 }).src).toContain(
      'media/b.webp',
    )
  })

  it('treats the nsfw prop of a work as the sexual act level', () => {
    limit = 'blur'
    violence = 'JUST_SHOW'
    const props = mount(HikariImage, {
      props: { src: { src: 'media/a.webp', thumb_hash: HASH }, nsfw: true },
    })
      .getComponent(Image)
      .props()
    expect(props.src).toMatch(/^data:image\/png;base64,/)
  })

  it('shows the fallback when an image the viewer may not reveal cannot be blurred', () => {
    limit = 'block'
    const props = render({ src: 'https://example.org/a.webp', sexual: 2 })
    expect(props.src).not.toContain('example.org')
    expect(props.src).not.toMatch(/^data:/)
  })
})
