import type { ReadingPosition, ReaderController } from '@ritojs/kit'
import type { Ref, ShallowRef } from 'vue'
import { DEFAULT_READER_ERROR } from './session'

interface ReaderEventTargets {
  currentPosition: ShallowRef<ReadingPosition | null>
  currentSpread: Ref<number>
  error: Ref<string | null>
  transitioning: Ref<boolean>
  totalSpreads: Ref<number>
}

export function bindReaderEvents(controller: ReaderController, targets: ReaderEventTargets) {
  const unsubscribers = [
    controller.on('spreadChange', ({ spreadIndex }) => {
      targets.currentSpread.value = spreadIndex
    }),
    controller.on('layoutChange', ({ totalSpreads }) => {
      targets.totalSpreads.value = totalSpreads
    }),
    controller.on('positionChange', ({ position }) => {
      targets.currentPosition.value = position
    }),
    controller.on('transitionStart', () => {
      targets.transitioning.value = true
    }),
    controller.on('transitionEnd', () => {
      targets.transitioning.value = false
    }),
    controller.on('error', ({ message }) => {
      targets.transitioning.value = false
      targets.error.value = message || DEFAULT_READER_ERROR
    }),
  ]

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
  }
}

export async function restorePosition(controller: ReaderController) {
  await controller.restorePosition()
}
