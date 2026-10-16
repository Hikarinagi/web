import {
  MANGA_READING_UNIT_NOUN,
  mangaChapterHeading,
  mangaChapterLabel,
  mangaReadingUnit,
  type MangaReadingUnit,
} from '@hikarinagi/shared'
import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
import {
  chapterRanges,
  contentsStatus,
  contentsUnits,
  type ContentsItem,
} from '~/features/manga/contents'
import { contentsPlace } from '~/features/manga/composables/useContents'

export function useReaderItems(data: () => MangaReadPageData) {
  const auth = useAuthStore()
  const { requireLogin } = useAuthGate()

  const manifest = computed(() => data().manifest)
  const chapter = computed(() => manifest.value.chapter)
  const unit = computed(() => mangaReadingUnit(chapter.value.chapter_type))
  const noun = computed(() => MANGA_READING_UNIT_NOUN[unit.value])
  const label = computed(() => mangaChapterLabel(chapter.value))
  const heading = computed(() => mangaChapterHeading(chapter.value))
  const serializing = computed(() => manifest.value.manga.serial_status === 'SERIALIZING')

  const units = computed(() => contentsUnits(data().chapters))
  const readIds = computed(() => new Set(data().progress?.read_chapter_ids ?? []))
  const progressPage = computed(() =>
    data().progress?.chapter.id === chapter.value.id ? (data().progress?.page ?? 0) : 0,
  )
  const status = computed(() => {
    const text = contentsStatus(units.value, !serializing.value)
    const at = manifest.value.manga.latest_chapter_at
    return text && serializing.value && at ? `${text} · ${timeFromNow(at)}` : text
  })
  const continueChapters = computed(
    () => unit.value === 'volume' && !manifest.value.next_chapter && units.value.chapter.length > 0,
  )

  const place = contentsPlace(units.value, chapter.value.id)
  const directoryUnit = ref<MangaReadingUnit>(place.unit)
  const directoryRange = ref<string | null>(place.range)
  const directoryOpen = ref(false)

  function openChapters() {
    directoryUnit.value = 'chapter'
    directoryRange.value = chapterRanges(units.value.chapter).at(-1)?.key ?? null
    directoryOpen.value = true
  }

  const leaving = ref<string | null>(null)

  function open(target: { id: number; label: string }) {
    if (leaving.value) return
    leaving.value = `正在打开 ${target.label}`
    directoryOpen.value = false
    void navigateTo(`/mangas/${manifest.value.manga.id}/read/${target.id}`, { replace: true })
  }

  function select(item: ContentsItem) {
    if (item.id === chapter.value.id) {
      directoryOpen.value = false
      return
    }
    if (!auth.isAuthenticated && !item.guest_readable) {
      requireLogin()
      return
    }
    open({ id: item.id, label: mangaChapterLabel(item) })
  }

  function openSibling(direction: 'next' | 'previous') {
    const target = direction === 'next' ? manifest.value.next_chapter : manifest.value.prev_chapter
    if (!target) return
    if (direction === 'next' && manifest.value.next_chapter_locked) {
      requireLogin()
      return
    }
    open({ id: target.id, label: mangaChapterLabel(target) })
  }

  return {
    manifest,
    chapter,
    unit,
    noun,
    label,
    heading,
    serializing,
    units,
    readIds,
    progressPage,
    status,
    continueChapters,
    directoryUnit,
    directoryRange,
    directoryOpen,
    openChapters,
    leaving,
    select,
    openSibling,
  }
}
