import type { ReaderAnnotationTarget, ReaderSourcePoint } from '@ritojs/core'
import type { ReadingPosition } from '@ritojs/kit'

function pointOf(point: ReaderSourcePoint) {
  return { nodePath: [...point.nodePath], textOffset: point.textOffset }
}

export function positionOf(position: ReadingPosition) {
  const locator = position.sourceLocator
  return {
    sourceLocator: locator && {
      href: locator.href,
      anchorId: locator.anchorId,
      progression: locator.progression,
      sourcePoint: locator.sourcePoint && pointOf(locator.sourcePoint),
      sourceRange: locator.sourceRange && {
        start: pointOf(locator.sourceRange.start),
        end: pointOf(locator.sourceRange.end),
      },
    },
    projection: { ...position.projection },
    progress: position.progress,
    timestamp: position.timestamp,
  }
}

export function targetOf(target: ReaderAnnotationTarget) {
  return {
    version: target.version,
    href: target.href,
    sourceRange: {
      start: pointOf(target.sourceRange.start),
      end: pointOf(target.sourceRange.end),
    },
    quote: { ...target.quote },
    position: { ...target.position },
  }
}
