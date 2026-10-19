import type { InjectionKey } from 'vue'
import type { TocRow } from './toc'
import type { ReaderAnalytics } from './useReaderAnalytics'
import type { ReaderBookmarks } from './useReaderBookmarks'
import type { ReaderEnd } from './useReaderEnd'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderErrors } from './useReaderErrors'
import type { ReaderEvents } from './useReaderEvents'
import type { ReaderFonts } from './useReaderFonts'
import type { ReaderHighlights } from './useReaderHighlights'
import type { ReaderJumps } from './useReaderJumps'
import type { ReaderLocation } from './useReaderLocation'
import type { ReaderResume } from './useReaderResume'
import type { ReaderSearch } from './useReaderSearch'
import type { ReaderSelection } from './useReaderSelection'
import type { ReaderSettings } from './useReaderSettings'
import type { ReaderShell } from './useReaderShell'
import type { ReaderTour } from './useReaderTour'

export interface ReaderContext {
  title: Readonly<Ref<string>>
  host: Ref<HTMLElement | null>
  settings: ReaderSettings
  shell: ReaderShell
  engine: ReaderEngine
  location: ReaderLocation
  fonts: ReaderFonts
  highlights: ReaderHighlights
  bookmarks: ReaderBookmarks
  selection: ReaderSelection
  jumps: ReaderJumps
  search: ReaderSearch
  events: ReaderEvents
  resume: ReaderResume
  end: ReaderEnd
  tour: ReaderTour
  errors: ReaderErrors
  analytics: ReaderAnalytics
  goTo: (row: TocRow) => void
  turn: (forward: boolean) => void
}

const READER_CONTEXT: InjectionKey<ReaderContext> = Symbol('light-novel-reader')

export function provideReader(context: ReaderContext) {
  provide(READER_CONTEXT, context)
}

export function useReader() {
  const context = inject(READER_CONTEXT)
  if (!context) throw new Error('useReader() must be called inside the light novel reader')
  return context
}
