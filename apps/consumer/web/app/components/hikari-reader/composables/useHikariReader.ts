import type { TocEntry } from '@ritojs/core'
import type { ReadingPosition } from '@ritojs/core/position'
import type { Reader } from '@ritojs/core/web'
import type { ReaderController } from '@ritojs/kit'
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { bindReaderEvents, restorePosition } from '../lib/events'
import { getSpreadMode } from '../lib/layout'
import { disposeReaderStack, createReaderStack } from '../lib/runtime'
import { getReaderError, loadReaderEpub, resolveViewport } from '../lib/session'
import { useReaderDurationTracker } from './useReaderDurationTracker'
import { useReaderProgressSync } from './useReaderProgressSync'
import { useReaderResize } from './useReaderResize'
import { useReaderSettingsSync } from './useReaderSettingsSync'
import type { HikariReaderInput, ReaderStack } from '../types'

export function useHikariReader(input: HikariReaderInput) {
  const surface = ref<HTMLElement | null>(null)
  const controller = shallowRef<ReaderController | null>(null)
  const reader = shallowRef<Reader | null>(null)
  const toc = shallowRef<readonly TocEntry[]>([])
  const currentPosition = shallowRef<ReadingPosition | null>(null)
  const currentSpread = ref(0)
  const totalSpreads = ref(0)
  const isLoading = ref(false)
  const isTransitioning = ref(false)
  const error = ref<string | null>(null)

  let requestId = 0
  let disposeEvents: (() => void) | null = null
  const resize = useReaderResize({ controller, settings: input.settings, surface })
  useReaderSettingsSync({
    controller,
    settings: input.settings,
    surface,
    refreshLayout: () => resize.refresh(),
  })
  const duration = useReaderDurationTracker()
  useReaderProgressSync({
    volumeId: input.volumeId,
    reader,
    currentPosition,
    durationTracker: duration,
  })

  const progressPercentage = computed(() => {
    if (currentPosition.value) return Math.round(currentPosition.value.progress * 1000) / 10
    return input.state.progress?.percentage ?? 0
  })
  const isLoaded = computed(() => Boolean(controller.value))
  const canGoPrevious = computed(() => currentSpread.value > 0)
  const canGoNext = computed(
    () => totalSpreads.value > 0 && currentSpread.value < totalSpreads.value - 1,
  )

  async function load() {
    if (!import.meta.client || isLoading.value) return

    const activeRequestId = ++requestId
    isLoading.value = true
    error.value = null

    try {
      const viewport = await resolveViewport(surface.value)
      const epub = await loadReaderEpub(input.volumeId)
      if (activeRequestId !== requestId || !surface.value) return

      const stack = await createReaderStack(epub, viewport, input)
      if (activeRequestId !== requestId) {
        disposeReaderStack(stack)
        return
      }

      dispose()
      if (!mountStack(stack, viewport.width)) return
      await restorePosition(stack.controller)
    } catch (err) {
      if (activeRequestId === requestId) error.value = getReaderError(err)
    } finally {
      if (activeRequestId === requestId) isLoading.value = false
    }
  }

  function mountStack(stack: ReaderStack, width: number) {
    const target = surface.value
    if (!target) {
      disposeReaderStack(stack)
      return false
    }

    reader.value = stack.reader
    controller.value = stack.controller
    toc.value = stack.reader.toc
    totalSpreads.value = stack.reader.totalSpreads
    currentSpread.value = 0
    currentPosition.value = null
    isTransitioning.value = false
    disposeEvents = bindReaderEvents(stack.controller, {
      currentPosition,
      currentSpread,
      error,
      transitioning: isTransitioning,
      totalSpreads,
    })
    stack.controller.mount(target)
    resize.watch(getSpreadMode(width))
    return true
  }

  function dispose() {
    disposeEvents?.()
    disposeEvents = null
    controller.value?.dispose()
    reader.value?.dispose()
    controller.value = null
    reader.value = null
    isTransitioning.value = false
    surface.value?.replaceChildren()
    resize.dispose()
  }

  onBeforeUnmount(() => {
    requestId++
    dispose()
  })

  return {
    canGoNext,
    canGoPrevious,
    controller,
    currentPosition,
    currentSpread,
    error,
    goTo: (entry: TocEntry) => controller.value?.navigateToTocEntry(entry),
    isLoaded,
    isLoading,
    isTransitioning,
    load,
    next: () => controller.value?.nextSpread(),
    previous: () => controller.value?.prevSpread(),
    progressPercentage,
    reader,
    retry: () => void load(),
    surface,
    toc,
    totalSpreads,
  }
}
