import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useStageGestures } from '~/components/manga/reader/composables/useStageGestures'
import { useStageZoom } from '~/components/manga/reader/composables/useStageZoom'

const VIEWPORT_WIDTH = 800
const VIEWPORT_HEIGHT = 600

function pointer(clientX: number, clientY: number, pointerId = 1) {
  return {
    pointerId,
    pointerType: 'touch',
    button: 0,
    clientX,
    clientY,
  } as unknown as PointerEvent
}

function touchMove(element: HTMLElement, clientX: number, clientY: number) {
  const event = new Event('touchmove', { cancelable: true, bubbles: true })
  Object.defineProperty(event, 'touches', { value: [{ clientX, clientY }] })
  element.dispatchEvent(event)
  return event
}

function fixSize(el: HTMLElement, width: number, height: number) {
  Object.defineProperty(el, 'clientWidth', { value: width })
  Object.defineProperty(el, 'clientHeight', { value: height })
  Object.defineProperty(el, 'offsetWidth', { value: width })
  Object.defineProperty(el, 'offsetHeight', { value: height })
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: width, bottom: height, width, height, x: 0, y: 0 }) as DOMRect
}

type Gestures = ReturnType<typeof useStageGestures>
type Zoom = ReturnType<typeof useStageZoom>

async function mountStage({ animate = true, zoomable = false } = {}) {
  const turns: string[] = []
  const Harness = defineComponent({
    setup(_props, { expose }) {
      const viewport = ref<HTMLElement | null>(null)
      const content = ref<HTMLElement | null>(null)
      const zoom = useStageZoom({
        viewport,
        content: () => content.value,
        enabled: () => zoomable,
      })
      const gestures = useStageGestures({
        viewport,
        canGoNext: () => true,
        canGoPrevious: () => true,
        animate: () => animate,
        zoomable: () => zoomable,
        zoom,
        next: () => turns.push('next'),
        previous: () => turns.push('previous'),
        onTap: () => turns.push('tap'),
      })
      expose({ gestures, zoom })
      return () => h('div', { ref: viewport }, [h('div', { ref: content })])
    },
  })

  const wrapper = mount(Harness)
  const element = wrapper.element as HTMLElement
  fixSize(element, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
  fixSize(element.firstElementChild as HTMLElement, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
  element.setPointerCapture = () => {}
  // `useEventListener` binds on the post-flush queue once the viewport ref lands.
  await nextTick()
  const vm = wrapper.vm as unknown as { gestures: Gestures; zoom: Zoom }
  return { element, turns, gestures: vm.gestures, zoom: vm.zoom }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useStageGestures — scrolling layouts', () => {
  it('still commits the page turn when the browser cancels the pointer mid-swipe', async () => {
    vi.useFakeTimers()
    const { gestures, turns } = await mountStage()
    gestures.onPointerDown(pointer(100, 300))
    gestures.onPointerMove(pointer(140, 302))
    gestures.onPointerMove(pointer(360, 304))
    gestures.onPointerCancel(pointer(360, 304))
    vi.advanceTimersByTime(300)
    expect(turns).toEqual(['next'])
    expect(gestures.dragX.value).toBe(0)
  })

  it('snaps back when the cancelled swipe never travelled far enough', async () => {
    vi.useFakeTimers()
    const { gestures, turns } = await mountStage()
    gestures.onPointerDown(pointer(100, 300))
    gestures.onPointerMove(pointer(112, 301))
    gestures.onPointerCancel(pointer(112, 301))
    vi.advanceTimersByTime(300)
    expect(turns).toEqual([])
  })

  it('claims horizontal touchmoves so the browser cannot pan the page away', async () => {
    const { gestures, element } = await mountStage()
    gestures.onPointerDown(pointer(100, 300))
    expect(touchMove(element, 140, 304).defaultPrevented).toBe(true)
  })

  it('leaves vertical touchmoves to the native scroller', async () => {
    const { gestures, element } = await mountStage()
    gestures.onPointerDown(pointer(100, 300))
    expect(touchMove(element, 104, 360).defaultPrevented).toBe(false)
  })

  it('reports a tap immediately when there is no double-tap to wait for', async () => {
    const { gestures, turns } = await mountStage()
    gestures.onPointerDown(pointer(400, 300))
    gestures.onPointerUp(pointer(401, 300))
    expect(turns).toEqual(['tap'])
  })

  it('turns without dragging or animating when page animation is off', async () => {
    const { gestures, turns } = await mountStage({ animate: false })
    gestures.onPointerDown(pointer(100, 300))
    gestures.onPointerMove(pointer(140, 302))
    gestures.onPointerMove(pointer(360, 304))
    expect(gestures.dragX.value).toBe(0)
    gestures.onPointerUp(pointer(360, 304))
    expect(turns).toEqual(['next'])
    expect(gestures.animating.value).toBe(false)
  })
})

describe('useStageGestures — zoomable layout', () => {
  async function doubleTap(at = 400) {
    const stage = await mountStage({ zoomable: true })
    stage.gestures.onPointerDown(pointer(at, 300))
    stage.gestures.onPointerUp(pointer(at, 300))
    stage.gestures.onPointerDown(pointer(at, 300))
    stage.gestures.onPointerUp(pointer(at, 300))
    return stage
  }

  it('toggles between 1x and 2.5x on double tap', async () => {
    const { gestures, zoom } = await doubleTap()
    expect(zoom.scale.value).toBeCloseTo(2.5)

    gestures.onPointerDown(pointer(400, 300))
    gestures.onPointerUp(pointer(400, 300))
    gestures.onPointerDown(pointer(400, 300))
    gestures.onPointerUp(pointer(400, 300))
    expect(zoom.scale.value).toBe(1)
  })

  it('does not toggle the chrome for either half of a double tap', async () => {
    vi.useFakeTimers()
    const { turns } = await doubleTap()
    vi.advanceTimersByTime(600)
    expect(turns).toEqual([])
  })

  it('defers a single tap so it can still turn out to be a double tap', async () => {
    vi.useFakeTimers()
    const { gestures, turns } = await mountStage({ zoomable: true })
    gestures.onPointerDown(pointer(400, 300))
    gestures.onPointerUp(pointer(400, 300))
    expect(turns).toEqual([])
    vi.advanceTimersByTime(400)
    expect(turns).toEqual(['tap'])
  })

  it('pans the zoomed page instead of turning it', async () => {
    const { gestures, zoom, turns } = await doubleTap()
    gestures.onPointerDown(pointer(400, 300))
    gestures.onPointerMove(pointer(360, 300))
    gestures.onPointerMove(pointer(320, 300))
    gestures.onPointerUp(pointer(320, 300))
    expect(turns).toEqual([])
    expect(zoom.scale.value).toBeCloseTo(2.5)
  })

  it('hands the drag over to paging once the pan runs out of room', async () => {
    vi.useFakeTimers()
    // Double tap on the left edge so the pan is already against its right stop.
    const { gestures, turns } = await doubleTap(0)
    gestures.onPointerDown(pointer(400, 300))
    gestures.onPointerMove(pointer(460, 300))
    gestures.onPointerMove(pointer(700, 300))
    gestures.onPointerUp(pointer(700, 300))
    vi.advanceTimersByTime(300)
    expect(turns).toEqual(['next'])
  })

  it('does not read the finger left over from a pinch as a tap', async () => {
    vi.useFakeTimers()
    const { gestures, turns } = await mountStage({ zoomable: true })
    gestures.onPointerDown(pointer(380, 300, 1))
    gestures.onPointerDown(pointer(420, 300, 2))
    gestures.onPointerMove(pointer(300, 300, 1))
    gestures.onPointerMove(pointer(500, 300, 2))
    gestures.onPointerUp(pointer(500, 300, 2))
    gestures.onPointerUp(pointer(300, 300, 1))
    vi.advanceTimersByTime(600)
    expect(turns).toEqual([])
  })

  it('pinches within 1x-4x and springs back past the limit', async () => {
    const { gestures, zoom } = await mountStage({ zoomable: true })
    gestures.onPointerDown(pointer(380, 300, 1))
    gestures.onPointerDown(pointer(420, 300, 2))
    gestures.onPointerMove(pointer(200, 300, 1))
    gestures.onPointerMove(pointer(600, 300, 2))
    expect(zoom.scale.value).toBeCloseTo(4.5)

    gestures.onPointerUp(pointer(200, 300, 1))
    gestures.onPointerUp(pointer(600, 300, 2))
    expect(zoom.scale.value).toBe(4)
  })
})
