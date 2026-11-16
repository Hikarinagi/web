import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useGallery } from '../../app/features/galgame/useGallery'
import type { HikariImageSafety } from '../../app/utils/media/image'
import { imageLimit } from '../../app/utils/media/image'

const state = vi.hoisted(() => ({ limit: 'show' as 'show' | 'blur' | 'block' }))
const revealed = ref<string[]>([])

vi.mock('../../app/features/nsfw/composables/useNsfwPolicy', () => ({
  useNsfwPolicy: () => ({
    limitOf: (safety: HikariImageSafety) => {
      const limit = (
        { show: 'JUST_SHOW', blur: 'SHOW_WITH_SPOILER', block: 'NEVER_SHOW_NSFW_CONTENT' } as const
      )[state.limit]
      return imageLimit(safety, {
        sexual_1_limit: limit,
        sexual_2_limit: limit,
        violence_1_limit: limit,
        violence_2_limit: limit,
      })
    },
  }),
}))
vi.mock('../../app/features/nsfw/composables/useNsfwReveal', () => ({
  useNsfwReveal: () => ({ revealed }),
}))

const picture = (id: number, nsfw: boolean) => ({
  id,
  src: `images/${id}.webp`,
  nsfw,
  sexual: 0,
  violence: 0,
})

describe('useGallery', () => {
  beforeEach(() => {
    state.limit = 'show'
    revealed.value = []
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { cdnHost: 'https://cdn.example.com', imageProcessorHost: '' },
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const gallery = () =>
    useGallery(() => ({
      images: [picture(1, false), picture(2, true)],
      cover: picture(3, true),
      title: 'game',
    }))

  it('leaves blurred images out of the lightbox until they are shown', () => {
    state.limit = 'blur'
    const { items, viewable } = gallery()
    expect(items.value.map(item => item.id)).toEqual(['1'])
    expect(viewable(picture(3, true))).toBe(false)
    revealed.value = ['images/2.webp', 'images/3.webp']
    expect(items.value.map(item => item.id)).toEqual(['1', '2', 'cover'])
  })

  it('opens on the clicked image and falls back to the first one when it is hidden', () => {
    state.limit = 'blur'
    const { at, open, show } = gallery()
    show(1)
    expect(open.value).toBe(true)
    expect(at.value).toBe(0)
    revealed.value = ['images/2.webp']
    show(1)
    expect(at.value).toBe(1)
  })

  it('opens nothing when every image is hidden', () => {
    state.limit = 'block'
    revealed.value = ['images/2.webp']
    const { open, show } = useGallery(() => ({
      images: [picture(2, true)],
      cover: null,
      title: 'game',
    }))
    show(0)
    expect(open.value).toBe(false)
  })
})
