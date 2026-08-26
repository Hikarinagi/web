import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useReaderTapNavigation } from '~/components/hikari-reader/composables/useReaderTapNavigation'

const WIDTH = 900

function setup(tapZones = true) {
  const currentSpread = ref(5)
  const jumps: number[] = []
  const surface = document.createElement('div')
  surface.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: WIDTH, bottom: 600, width: WIDTH, height: 600 }) as DOMRect

  let api!: ReturnType<typeof useReaderTapNavigation>
  const Harness = defineComponent({
    setup() {
      api = useReaderTapNavigation({
        device: ref({ page_animation: true, tap_zones: tapZones }),
        isCoarsePointer: ref(true),
        isLoaded: ref(true),
        surface: ref(surface),
        currentSpread,
        jumpToSpread: index => {
          jumps.push(index)
          currentSpread.value = index
        },
        toggleToolbar: vi.fn(),
        next: () => (currentSpread.value += 1),
        previous: () => (currentSpread.value -= 1),
      })
      return () => h('div')
    },
  })
  mount(Harness)
  return { api, currentSpread, jumps, surface }
}

/** A clean tap in the right-hand zone, i.e. "next page". */
function tapNext(api: ReturnType<typeof useReaderTapNavigation>, surface: HTMLElement) {
  const touch = { identifier: 1, clientX: WIDTH - 40, clientY: 300 }
  api.onTouchStart({
    target: surface,
    timeStamp: 0,
    touches: [touch],
    changedTouches: [touch],
  } as unknown as TouchEvent)
  api.onTouchEnd({
    target: surface,
    timeStamp: 60,
    touches: [],
    changedTouches: [touch],
  } as unknown as TouchEvent)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useReaderTapNavigation — late content clicks', () => {
  it('takes back the turn when an image click arrives after the fact', () => {
    // Rito emits `imageClick` only once the blob resolves, which on a cache
    // miss lands well after the tap has already paged.
    const { api, currentSpread, jumps, surface } = setup()
    tapNext(api, surface)
    expect(currentSpread.value).toBe(6)

    api.suppressTap()
    expect(jumps).toEqual([5])
    expect(currentSpread.value).toBe(5)
  })

  it('leaves the turn alone once the reader has moved on', () => {
    const { api, currentSpread, jumps, surface } = setup()
    tapNext(api, surface)
    tapNext(api, surface)
    expect(currentSpread.value).toBe(7)

    // The first tap's image finally resolved, but two pages have passed.
    api.suppressTap()
    expect(jumps).toEqual([6])
    expect(currentSpread.value).toBe(6)
  })

  it('ignores a content click that arrives far too late', () => {
    vi.useFakeTimers()
    const { api, currentSpread, jumps, surface } = setup()
    tapNext(api, surface)
    vi.advanceTimersByTime(2000)
    api.suppressTap()
    expect(jumps).toEqual([])
    expect(currentSpread.value).toBe(6)
  })

  it('only reverts once for a single turn', () => {
    const { api, jumps, surface } = setup()
    tapNext(api, surface)
    api.suppressTap()
    api.suppressTap()
    expect(jumps).toEqual([5])
  })

  it('has nothing to revert when the tap only toggled the toolbar', () => {
    const { api, currentSpread, jumps } = setup(false)
    const surface = document.createElement('div')
    tapNext(api, surface)
    expect(currentSpread.value).toBe(5)
    api.suppressTap()
    expect(jumps).toEqual([])
  })
})
