import type { MangaReadingUnit } from '@hikarinagi/shared'
import {
  chapterRanges,
  contentsUnitOf,
  contentsUnits,
  defaultUnit,
  rangeOfItem,
  type ContentsItem,
  type ContentsProgress,
  type ContentsUnits,
} from '~/features/manga/contents'

export function useContentsDesc() {
  return useLocalStorage('hikari-manga-contents-desc', false, { initOnMounted: true })
}

export function contentsPlace(units: ContentsUnits, id: number | null | undefined) {
  const unit: MangaReadingUnit = defaultUnit(units, id)
  const item = units[unit].find(entry => entry.id === id)
  return {
    unit,
    range: unit === 'chapter' && item ? rangeOfItem(item, chapterRanges(units.chapter)) : null,
  }
}

export function useContents(
  source: () => {
    mangaId: number
    chapters: ContentsItem[]
    progress: ContentsProgress | null | undefined
  },
) {
  const auth = useAuthStore()
  const { requireLogin } = useAuthGate()

  const units = computed(() => contentsUnits(source().chapters))
  const readIds = computed(() => new Set(source().progress?.read_chapter_ids ?? []))
  const currentId = computed(() => {
    const id = source().progress?.chapter.id ?? null
    return contentsUnitOf(units.value, id) ? id : null
  })
  const currentPage = computed(() => source().progress?.page ?? 0)
  const signedIn = computed(() => auth.isAuthenticated)
  const place = contentsPlace(units.value, currentId.value)
  const unit = ref<MangaReadingUnit>(place.unit)
  const range = ref<string | null>(place.range)
  const desc = useContentsDesc()

  function open(item: ContentsItem) {
    if (!signedIn.value && !item.guest_readable) {
      requireLogin()
      return
    }
    void navigateTo(`/mangas/${source().mangaId}/read/${item.id}`)
  }

  return { units, readIds, currentId, currentPage, signedIn, unit, range, desc, open }
}
