import type { ReaderController } from '@ritojs/kit'
import type { Ref, ShallowRef } from 'vue'
import type { BackendReaderSettings } from '~/components/hikari-reader/types'
import { getReaderMargin, getSpreadMode, fontSizeToZoomScale } from '../lib/layout'
import type { ReaderSpreadMode } from '../types'

interface ReaderResizeOptions {
  controller: ShallowRef<ReaderController | null>
  settings: Ref<BackendReaderSettings>
  surface: Ref<HTMLElement | null>
}

export function useReaderResize(options: ReaderResizeOptions) {
  let observer: ResizeObserver | null = null
  let activeSpreadMode: ReaderSpreadMode = 'single'

  function applyLayout(containerWidth: number, containerHeight: number) {
    const controller = options.controller.value
    if (!controller) return
    if (containerWidth < 1 || containerHeight < 1) return

    const scale = fontSizeToZoomScale(options.settings.value.font_size)
    const vpWidth = Math.max(1, Math.round(containerWidth / scale))
    const vpHeight = Math.max(1, Math.round(containerHeight / scale))

    const nextSpreadMode = getSpreadMode(containerWidth)
    if (nextSpreadMode !== activeSpreadMode) {
      activeSpreadMode = nextSpreadMode
      controller.setSpreadMode(nextSpreadMode)
    }
    controller.setRenderScale(scale)
    controller.resize(vpWidth, vpHeight, getReaderMargin(vpWidth, options.settings.value.margins))
  }

  function watch(initialSpreadMode: ReaderSpreadMode) {
    const element = options.surface.value
    if (!element) return

    dispose()
    activeSpreadMode = initialSpreadMode
    observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      applyLayout(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height))
    })
    observer.observe(element)
  }

  function refresh() {
    const element = options.surface.value
    if (!element) return
    applyLayout(Math.round(element.clientWidth), Math.round(element.clientHeight))
  }

  function dispose() {
    observer?.disconnect()
    observer = null
  }

  return { dispose, watch, refresh }
}
