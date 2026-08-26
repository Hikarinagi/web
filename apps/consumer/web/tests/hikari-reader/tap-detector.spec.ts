import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import {
  useReaderTapDetector,
  type ReaderTapPoint,
} from '~/components/hikari-reader/composables/useReaderTapDetector'

interface TouchLike {
  identifier: number
  clientX: number
  clientY: number
}

function touchEvent(target: HTMLElement, timeStamp: number, touches: TouchLike[], ended = false) {
  return {
    target,
    timeStamp,
    touches: ended ? [] : touches,
    changedTouches: touches,
  } as unknown as TouchEvent
}

function setup() {
  const taps: ReaderTapPoint[] = []
  const enabled = ref(true)
  const isLoaded = ref(true)
  const detector = useReaderTapDetector({
    enabled,
    isLoaded,
    onTap: point => taps.push(point),
  })
  const surface = document.createElement('div')
  return { taps, enabled, isLoaded, detector, surface }
}

describe('useReaderTapDetector', () => {
  it('reports the release point of a short, steady touch', () => {
    const { taps, detector, surface } = setup()
    detector.onTouchStart(
      touchEvent(surface, 1000, [{ identifier: 1, clientX: 100, clientY: 200 }]),
    )
    detector.onTouchEnd(
      touchEvent(surface, 1120, [{ identifier: 1, clientX: 102, clientY: 201 }], true),
    )
    expect(taps).toEqual([{ x: 102, y: 201 }])
  })

  it('swallows the compatibility click that trails a handled tap exactly once', () => {
    const { detector, surface } = setup()
    detector.onTouchStart(
      touchEvent(surface, 1000, [{ identifier: 1, clientX: 100, clientY: 200 }]),
    )
    detector.onTouchEnd(
      touchEvent(surface, 1120, [{ identifier: 1, clientX: 100, clientY: 200 }], true),
    )
    expect(detector.consumeGhostClick()).toBe(true)
    expect(detector.consumeGhostClick()).toBe(false)
  })

  it('leaves clicks alone when the gesture was not a tap it handled', () => {
    const { taps, detector, surface } = setup()
    detector.onTouchStart(
      touchEvent(surface, 1000, [{ identifier: 1, clientX: 100, clientY: 200 }]),
    )
    detector.onTouchEnd(
      touchEvent(surface, 1120, [{ identifier: 1, clientX: 160, clientY: 200 }], true),
    )
    expect(taps).toEqual([])
    expect(detector.consumeGhostClick()).toBe(false)
  })

  it('ignores taps that land on reader UI', () => {
    const { taps, detector } = setup()
    const bar = document.createElement('div')
    bar.setAttribute('data-reader-ui', '')
    const button = document.createElement('button')
    bar.append(button)
    detector.onTouchStart(touchEvent(button, 1000, [{ identifier: 1, clientX: 10, clientY: 20 }]))
    detector.onTouchEnd(
      touchEvent(button, 1050, [{ identifier: 1, clientX: 10, clientY: 20 }], true),
    )
    expect(taps).toEqual([])
    expect(detector.consumeGhostClick()).toBe(false)
  })

  it('stays out of the way while disabled', () => {
    const { taps, enabled, detector, surface } = setup()
    enabled.value = false
    detector.onTouchStart(
      touchEvent(surface, 1000, [{ identifier: 1, clientX: 100, clientY: 200 }]),
    )
    detector.onTouchEnd(
      touchEvent(surface, 1050, [{ identifier: 1, clientX: 100, clientY: 200 }], true),
    )
    expect(taps).toEqual([])
  })

  it('forgets a mouse gesture that was cancelled before release', () => {
    const { taps, detector, surface } = setup()
    const down = {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 100,
      clientY: 200,
      timeStamp: 1000,
      target: surface,
    } as unknown as PointerEvent
    const up = { ...down, timeStamp: 1100 } as unknown as PointerEvent
    detector.onPointerDown(down)
    detector.onPointerCancel()
    detector.onPointerUp(up)
    expect(taps).toEqual([])
  })
})
