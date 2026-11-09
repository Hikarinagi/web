import type { InjectionKey, ShallowRef } from 'vue'
import type {
  BackendMangaBaselinePage,
  BackendMangaCheck,
  BackendMangaNote,
  BackendMangaPage,
  BackendMangaProject,
  MangaNoteRect,
} from '../manga'
import type { ReviewState } from './useReviewState'
import type { NoteAnchor } from './useViewport'

export type MangaReviewContext = {
  state: ReviewState
  project: ComputedRef<BackendMangaProject>
  pages: ComputedRef<BackendMangaPage[]>
  baseline: ComputedRef<BackendMangaBaselinePage[]>
  check: ShallowRef<BackendMangaCheck | null>
  notes: Ref<BackendMangaNote[]>
  drawing: Ref<boolean>
  pending: Ref<{ page_id: number; rect: MangaNoteRect; anchor: NoteAnchor } | null>
  focus: Ref<{ page_id: number; rect: MangaNoteRect | null } | null>
  startNote: () => void
  openNote: (note: BackendMangaNote) => void
}

export const MANGA_REVIEW: InjectionKey<MangaReviewContext> = Symbol('manga-review')

export function useMangaReview() {
  const context = inject(MANGA_REVIEW)
  if (!context) throw new Error('useMangaReview() must be used inside the manga review page')
  return context
}
