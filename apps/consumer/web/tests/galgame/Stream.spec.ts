import { mount } from '@vue/test-utils'
import type { Ref } from 'vue'
import { nextTick, ref } from 'vue'
import type { Mock } from 'vitest'
import { describe, expect, it, vi } from 'vitest'
import Stream from '../../app/components/galgame/explore/recommend/Stream.vue'

let observe: ((entries: { isIntersecting: boolean }[]) => void) | undefined
let stream: {
  modules: Ref<never[]>
  loading: Ref<boolean>
  failed: Ref<boolean>
  done: Ref<boolean>
  loadMore: Mock
}

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    useIntersectionObserver: (
      _target: unknown,
      callback: (entries: { isIntersecting: boolean }[]) => void,
    ) => {
      observe = callback
      return { stop: vi.fn() }
    },
  }
})

vi.mock('~/features/galgame/useHomeStream', () => ({
  useGalgameHomeStream: () => stream,
}))

describe('Galgame recommendation stream', () => {
  it('keeps filling while the sentinel remains inside the preload area', async () => {
    const loading = ref(false)
    const done = ref(false)
    let batches = 0
    const loadMore = vi.fn(async () => {
      loading.value = true
      await nextTick()
      batches += 1
      loading.value = false
      if (batches === 2) done.value = true
    })
    stream = {
      modules: ref([]),
      loading,
      failed: ref(false),
      done,
      loadMore,
    }
    mount(Stream, {
      global: {
        stubs: {
          Button: true,
          Spinner: true,
          GalgameExploreRecommendFeature: true,
          GalgameExploreRecommendRail: true,
          GalgameExploreRecommendGrid: true,
        },
      },
    })

    observe?.([{ isIntersecting: true }])

    await vi.waitFor(() => expect(loadMore).toHaveBeenCalledTimes(2))
  })
})
