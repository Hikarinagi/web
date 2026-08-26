import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import type { ReaderController } from '@ritojs/kit'
import { useReaderAnnotations } from '~/components/hikari-reader/composables/useReaderAnnotations'

type Handler = (payload: unknown) => void

function setup() {
  const handlers = new Map<string, Handler>()
  const controller = {
    annotations: [],
    on(event: string, handler: Handler) {
      handlers.set(event, handler)
      return () => handlers.delete(event)
    },
  } as unknown as ReaderController

  const suppressTap = vi.fn()
  let api!: ReturnType<typeof useReaderAnnotations>

  const Harness = defineComponent({
    setup() {
      api = useReaderAnnotations({
        volumeId: 1,
        controller: shallowRef(controller),
        reader: shallowRef(null),
        currentPosition: shallowRef(null),
        surface: ref(null),
        goToSpread: vi.fn(),
        suppressTap,
        initial: [],
      })
      return () => h('div')
    },
  })

  mount(Harness)
  return { api, handlers, suppressTap }
}

function clickAnnotation(handlers: Map<string, Handler>, id = 'a1') {
  handlers.get('annotationClick')?.({ annotation: { id }, x: 10, y: 20 })
}

function element(attribute?: string) {
  const el = document.createElement('div')
  if (attribute) el.setAttribute(attribute, '')
  return el
}

describe('useReaderAnnotations — tap ownership', () => {
  it('claims the tap that opened an annotation so it cannot also page', () => {
    const { handlers, suppressTap } = setup()
    clickAnnotation(handlers)
    expect(suppressTap).toHaveBeenCalledOnce()
  })

  it('reports that an outside pointer was spent dismissing the popover', () => {
    const { api, handlers } = setup()
    clickAnnotation(handlers)
    expect(api.handleOutsidePointer(element())).toBe(true)
  })

  it('leaves a pointer inside the popover to the popover', () => {
    const { api, handlers } = setup()
    clickAnnotation(handlers)
    expect(api.handleOutsidePointer(element('data-reader-action-popover'))).toBe(false)
    expect(api.handleOutsidePointer(element('data-reader-selection-popover'))).toBe(false)
  })

  it('does not claim a pointer when nothing is open', () => {
    const { api } = setup()
    expect(api.handleOutsidePointer(element())).toBe(false)
  })

  it('stops claiming once the popover is closed', () => {
    const { api, handlers } = setup()
    clickAnnotation(handlers)
    expect(api.handleOutsidePointer(element())).toBe(true)
    expect(api.handleOutsidePointer(element())).toBe(false)
  })
})
