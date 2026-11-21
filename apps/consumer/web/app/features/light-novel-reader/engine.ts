import {
  createReader,
  type Reader,
  type ReaderLocator,
  type ReaderMargin,
  type ReaderShardedPublication,
  type ReaderHostFontFace,
  type ReaderSpreadMode,
} from '@ritojs/core'
import {
  createController,
  createPaperTurn,
  type PagePainter,
  type ReaderController,
  type ReadingPosition,
  type RecordStorageAdapter,
  type TransitionEffect,
  type TransitionEffectName,
} from '@ritojs/kit'
import type { ReaderEffect, ReaderFlow, ReaderSpread } from './settings'
import type { ReaderTheme } from './themes'

export function effectOf(effect: ReaderEffect): TransitionEffectName | TransitionEffect {
  return effect === 'paper' ? createPaperTurn() : effect
}

export function spreadOf(
  mode: ReaderSpread,
  size: { width: number; height: number },
  margin: number,
  fontSize: number,
) {
  if (size.height >= size.width || mode === 'single') return 'single'
  if (mode === 'double') return 'double'
  return (size.width / 2 - margin * 2) / fontSize >= 22 ? 'double' : 'single'
}

export function marginOf(
  flow: ReaderFlow,
  width: number,
  margin: number,
  pageWidth: number,
): ReaderMargin {
  if (flow === 'paged') return margin
  return { x: Math.floor((width - Math.min(width, pageWidth)) / 2) + margin, y: margin }
}

export function locatorOf(position: unknown): ReaderLocator | undefined {
  if (!position || typeof position !== 'object') return undefined
  const stored = position as Partial<ReadingPosition>
  if (stored.sourceLocator?.href) return stored.sourceLocator
  const legacy = stored.locator
  if (!legacy?.manifestHref) return undefined
  return {
    href: legacy.manifestHref,
    sourcePoint: legacy.sourcePoint,
    progression: legacy.chapterProgress,
  }
}

export function layoutWhere(reader: Reader, scrolled: boolean) {
  const holds = () => (reader.getScrollLayout() !== undefined) === scrolled
  if (holds()) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    let stop = () => {}
    const timeout = setTimeout(() => {
      stop()
      reject(new Error('The reader was not laid out in time'))
    }, 15_000)
    stop = reader.onLayoutCommitted(() => {
      if (!holds()) return
      clearTimeout(timeout)
      stop()
      resolve()
    })
  })
}

export async function createStack(options: {
  publication: ReaderShardedPublication
  size: { width: number; height: number }
  margin: ReaderMargin
  spread: ReaderSpreadMode
  fontSize: number
  lineHeight: number
  theme: ReaderTheme
  face: ReaderHostFontFace
  effect: ReaderEffect
  initialLocator?: ReaderLocator
  annotations: RecordStorageAdapter
  paintPage: PagePainter
  prepare: (reader: Reader) => Promise<void>
}) {
  const canvas = document.createElement('canvas')
  const reader = await createReader(options.publication, canvas, {
    width: options.size.width,
    height: options.size.height,
    margin: options.margin,
    spread: options.spread,
    spreadGap: 0,
    backgroundColor: options.theme.background,
    foregroundColor: options.theme.text,
    fontSize: options.fontSize,
    lineHeight: options.lineHeight,
    lineHeightForce: true,
    pinnedFontPolicy: { schemaVersion: 1, faces: [options.face] },
    initialLocator: options.initialLocator,
  })
  try {
    await options.prepare(reader)
    const controller: ReaderController = createController(reader, canvas, {
      transition: { effect: effectOf(options.effect) },
      a11y: { enabled: true },
      annotationStorage: options.annotations,
      paintPage: options.paintPage,
    })
    return { reader, controller, canvas }
  } catch (error) {
    await reader.dispose()
    throw error
  }
}
