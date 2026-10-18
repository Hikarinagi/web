import {
  createReader,
  type Reader,
  type ReaderLocator,
  type ReaderShardedPublication,
  type ReaderHostFontFace,
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
import type { ReaderEffect, ReaderSpread } from './settings'
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

export async function createStack(options: {
  publication: ReaderShardedPublication
  size: { width: number; height: number }
  margin: number
  spread: 'single' | 'double'
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
