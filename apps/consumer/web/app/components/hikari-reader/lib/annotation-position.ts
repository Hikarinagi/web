import type { Reader } from '@ritojs/core'
import type { AnnotationRecord } from '@ritojs/kit'

function stripFragment(href: string): string {
  const idx = href.indexOf('#')
  return idx === -1 ? href : href.slice(0, idx)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**
 * An annotation's `target.href` may be a spine idref, a manifest href, or
 * either of those carrying a fragment. `chapterMap` only knows idrefs.
 */
export function chapterRangeOf(reader: Reader, href: string) {
  const direct = reader.chapterMap.get(href)
  if (direct) return direct

  const targetHref = stripFragment(href)
  for (const [idref, manifestHref] of reader.manifestHrefMap) {
    if (stripFragment(manifestHref) !== targetHref) continue
    return reader.chapterMap.get(idref) ?? null
  }
  return null
}

/**
 * `chapterMap` is keyed by spine idref, but the resolver keys chapters by
 * canonical href — the same thing an annotation's `target.href` holds. Handing
 * it the idref map means it never finds the chapter.
 */
export function chapterPageRangesOf(reader: Reader) {
  const ranges = new Map<string, { startPage: number; endPage: number }>()
  for (const [idref, range] of reader.chapterMap) {
    ranges.set(reader.manifestHrefMap.get(idref) ?? idref, range)
  }
  return ranges
}

/** Linear estimate from the chapter progress — only as good as even text density. */
export function progressPageOf(record: AnnotationRecord, reader: Reader) {
  const range = chapterRangeOf(reader, record.target.href)
  if (!range) return null

  const rawProgress = record.target.selectors.progression.chapterProgress
  const progress = Number.isFinite(rawProgress) ? clamp(rawProgress, 0, 1) : 0
  const offset = Math.round((range.endPage - range.startPage) * progress)
  return range.startPage + offset
}

/**
 * The estimate is the only page this module can produce.
 *
 * This used to try an exact resolution first, through `buildHitMap` and
 * `resolveAnnotations`. Both read `Page.content`, which the engine always
 * built empty, so the exact pass resolved nothing and every call already fell
 * through to the estimate below. `@ritojs/core` 2.0 removes `Reader.pages`,
 * `Reader.measurer` and both helpers, so the dead pass is gone with them and
 * the result is unchanged.
 *
 * An exact jump is now expressible for the first time: an annotation's
 * `target.selectors.sourceRange` is a durable source anchor, and
 * `controller.goToPosition({ sourceLocator: { href, sourceRange } })` resolves
 * it against the committed layout. That is a behaviour change, so it is left
 * for a follow-up rather than folded into this port.
 */
export function annotationPageIndex(record: AnnotationRecord, reader: Reader) {
  return progressPageOf(record, reader)
}
