import type { Reader } from '@ritojs/core'
import type { AnnotationRecord } from '@ritojs/kit'
import { buildHitMap, resolveAnnotations } from '@ritojs/kit'

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

/** Where the annotation actually starts, resolved against the current layout. */
export function exactPageOf(record: AnnotationRecord, reader: Reader) {
  const range = chapterRangeOf(reader, record.target.href)
  if (!range) return null

  const hitMaps = new Map<number, ReturnType<typeof buildHitMap>>()
  for (let pageIndex = range.startPage; pageIndex <= range.endPage; pageIndex++) {
    const page = reader.pages[pageIndex]
    if (page) hitMaps.set(page.index, buildHitMap(page))
  }

  const [resolved] = resolveAnnotations([record], {
    chapterIndices: reader.getChapterTextIndices(),
    hitMaps,
    chapterPageRanges: chapterPageRangesOf(reader),
    // Without the idref -> href bridge the resolver cannot find the chapter at
    // all, and every jump silently degrades to the progress estimate.
    chapterHrefMap: reader.manifestHrefMap,
    measurer: reader.measurer,
  })
  const pages = resolved?.segments.map(segment => segment.pageIndex) ?? []
  return pages.length ? Math.min(...pages) : null
}

/** Exact position where the layout can give one, estimate otherwise. */
export function annotationPageIndex(record: AnnotationRecord, reader: Reader) {
  return exactPageOf(record, reader) ?? progressPageOf(record, reader)
}
