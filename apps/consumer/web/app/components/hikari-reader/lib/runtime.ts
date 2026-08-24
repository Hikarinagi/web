import { createReader } from '@ritojs/core'
import { createController } from '@ritojs/kit'
import { createControllerOptions, createReaderOptions } from './layout'
import { loadPinnedFontPolicy } from './pinned-fonts'
import type { HikariReaderInput, ReaderStack, ReaderViewport } from '../types'

export async function createReaderStack(
  epub: ArrayBuffer,
  viewport: ReaderViewport,
  input: HikariReaderInput,
): Promise<ReaderStack> {
  const canvas = document.createElement('canvas')
  const pinnedFontPolicy = await loadPinnedFontPolicy()
  const reader = await createReader(epub, canvas, {
    ...createReaderOptions(viewport, input),
    pinnedFontPolicy,
  })

  try {
    const controller = createController(reader, canvas, createControllerOptions(input))
    return { reader, controller }
  } catch (error) {
    reader.dispose()
    throw error
  }
}

export function disposeReaderStack(stack: ReaderStack | null) {
  stack?.controller.dispose()
  stack?.reader.dispose()
}
