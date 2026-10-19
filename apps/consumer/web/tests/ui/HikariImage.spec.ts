import { Image } from '@hina-ui/vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toValue } from 'vue'
import HikariImage from '../../app/components/ui/HikariImage.vue'
import type { HikariImageSource } from '../../app/utils/media/image'

const HASH = '3OcRJYB4d3h/iIeHeEh3eIhw+j3A'

describe('HikariImage', () => {
  let limit: 'show' | 'blur' | 'block'

  beforeEach(() => {
    limit = 'show'
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { cdnHost: 'https://cdn.example.com', imageProcessorHost: 'https://img.example.com' },
    }))
    vi.stubGlobal('useNsfwPolicy', () => ({
      shouldBlockNsfw: (nsfw: unknown) => limit === 'block' && Boolean(toValue(nsfw)),
      shouldBlurNsfw: (nsfw: unknown) => limit === 'blur' && Boolean(toValue(nsfw)),
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

  it('never shows the thumb hash of a blocked image', () => {
    limit = 'block'
    const props = render({ src: 'media/a.webp', thumb_hash: HASH, sexual: 2 })
    expect(props.thumbhash).toBeUndefined()
    expect(props.src).not.toContain('media/a.webp')
    expect(props.src).not.toMatch(/^data:/)
  })
})
