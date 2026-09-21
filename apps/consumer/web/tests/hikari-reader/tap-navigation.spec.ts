import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useReaderTapNavigation } from '~/components/hikari-reader/composables/useReaderTapNavigation'

const WIDTH = 900

function setup(tapZones = true) {
  const spread = ref(5)
  const surface = document.createElement('div')
  surface.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: WIDTH, bottom: 600, width: WIDTH, height: 600 }) as DOMRect

  let api!: ReturnType<typeof useReaderTapNavigation>
  const Harness = defineComponent({
    setup() {
      api = useReaderTapNavigation({
        device: ref({ page_animation: true, tap_zones: tapZones }),
        isLoaded: ref(true),
        surface: ref(surface),
        next: () => (spread.value += 1),
        previous: () => (spread.value -= 1),
      })
      return () => h('div')
    },
  })
  mount(Harness)
  return { api, spread, surface }
}

function tapAt(api: ReturnType<typeof useReaderTapNavigation>, surface: HTMLElement, x: number) {
  const touch = { identifier: 1, clientX: x, clientY: 300 }
  const event = (timeStamp: number, ongoing: boolean) =>
    ({
      target: surface,
      timeStamp,
      touches: ongoing ? [touch] : [],
      changedTouches: [touch],
    }) as unknown as TouchEvent
  api.onTouchStart(event(0, true))
  api.onTouchEnd(event(60, false))
}

describe('useReaderTapNavigation', () => {
  it('turns the page from the left and right zones', () => {
    const { api, spread, surface } = setup()
    tapAt(api, surface, WIDTH - 40)
    expect(spread.value).toBe(6)
    tapAt(api, surface, 40)
    expect(spread.value).toBe(5)
  })

  it('leaves the middle of the page alone', () => {
    const { api, spread, surface } = setup()
    tapAt(api, surface, WIDTH / 2)
    expect(spread.value).toBe(5)
  })

  it('does nothing at all while tap zones are off', () => {
    const { api, spread, surface } = setup(false)
    tapAt(api, surface, WIDTH - 40)
    expect(spread.value).toBe(5)
  })

  it('skips the turn when content claimed the tap first', () => {
    // Rito dispatches a link hit from its own canvas handler, which runs before
    // our release handler gets to read the tap.
    const { api, spread, surface } = setup()
    api.suppressTap()
    tapAt(api, surface, WIDTH - 40)
    expect(spread.value).toBe(5)
  })

  it('only holds that claim for the tap it was made for', () => {
    const { api, spread, surface } = setup()
    api.suppressTap()
    tapAt(api, surface, WIDTH - 40)
    tapAt(api, surface, WIDTH - 40)
    expect(spread.value).toBe(6)
  })
})
