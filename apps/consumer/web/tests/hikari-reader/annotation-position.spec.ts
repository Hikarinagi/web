import { describe, expect, it } from 'vitest'
import type { Reader } from '@ritojs/core'
import type { AnnotationRecord } from '@ritojs/kit'
import {
  chapterPageRangesOf,
  chapterRangeOf,
  progressPageOf,
} from '~/components/hikari-reader/lib/annotation-position'

/** Spine idrefs on the left, canonical hrefs on the right — as an EPUB has it. */
function fakeReader() {
  return {
    chapterMap: new Map([
      ['ch1', { startPage: 0, endPage: 9 }],
      ['ch2', { startPage: 10, endPage: 29 }],
    ]),
    manifestHrefMap: new Map([
      ['ch1', 'text/chapter1.xhtml'],
      ['ch2', 'text/chapter2.xhtml'],
    ]),
  } as unknown as Reader
}

function record(href: string, chapterProgress: number) {
  return {
    target: { href, selectors: { progression: { chapterProgress } } },
  } as unknown as AnnotationRecord
}

describe('chapterPageRangesOf', () => {
  it('keys ranges by canonical href, not by spine idref', () => {
    // The resolver looks chapters up by the annotation's `target.href`. Handing
    // it the idref-keyed map means it never resolves and every jump silently
    // falls back to the progress estimate.
    const ranges = chapterPageRangesOf(fakeReader())
    expect([...ranges.keys()]).toEqual(['text/chapter1.xhtml', 'text/chapter2.xhtml'])
    expect(ranges.get('text/chapter2.xhtml')).toEqual({ startPage: 10, endPage: 29 })
  })

  it('keeps the idref when a chapter has no manifest href', () => {
    const reader = {
      chapterMap: new Map([['orphan', { startPage: 0, endPage: 1 }]]),
      manifestHrefMap: new Map(),
    } as unknown as Reader
    expect([...chapterPageRangesOf(reader).keys()]).toEqual(['orphan'])
  })
})

describe('chapterRangeOf', () => {
  it('resolves a spine idref directly', () => {
    expect(chapterRangeOf(fakeReader(), 'ch2')).toEqual({ startPage: 10, endPage: 29 })
  })

  it('resolves a manifest href back to its chapter', () => {
    expect(chapterRangeOf(fakeReader(), 'text/chapter2.xhtml')).toEqual({
      startPage: 10,
      endPage: 29,
    })
  })

  it('ignores a fragment on either side of the comparison', () => {
    expect(chapterRangeOf(fakeReader(), 'text/chapter2.xhtml#para-7')).toEqual({
      startPage: 10,
      endPage: 29,
    })
  })

  it('returns null for a chapter that is not in the book', () => {
    expect(chapterRangeOf(fakeReader(), 'text/missing.xhtml')).toBeNull()
  })
})

describe('progressPageOf', () => {
  it('interpolates within the chapter page range', () => {
    const reader = fakeReader()
    expect(progressPageOf(record('text/chapter2.xhtml', 0), reader)).toBe(10)
    expect(progressPageOf(record('text/chapter2.xhtml', 0.5), reader)).toBe(20)
    expect(progressPageOf(record('text/chapter2.xhtml', 1), reader)).toBe(29)
  })

  it('clamps a progress value that is out of range or unusable', () => {
    const reader = fakeReader()
    expect(progressPageOf(record('ch2', 2), reader)).toBe(29)
    expect(progressPageOf(record('ch2', -1), reader)).toBe(10)
    expect(progressPageOf(record('ch2', Number.NaN), reader)).toBe(10)
  })
})
