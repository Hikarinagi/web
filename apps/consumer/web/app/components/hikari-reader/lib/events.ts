import type { ReadingPosition, ReaderController } from '@ritojs/kit'
import type { Ref, ShallowRef } from 'vue'
import { DEFAULT_RUNTIME_ERROR } from './session'

export interface ReaderRuntimeError {
  message: string
  source: string
}

interface ReaderEventTargets {
  currentPosition: ShallowRef<ReadingPosition | null>
  currentSpread: Ref<number>
  runtimeError: ShallowRef<ReaderRuntimeError | null>
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
    controller.on('error', ({ message, source }) => {
      targets.transitioning.value = false
      targets.runtimeError.value = { message: message || DEFAULT_RUNTIME_ERROR, source }
    }),
  ]

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
  }
}

export async function restorePosition(controller: ReaderController) {
  await controller.restorePosition()
}
