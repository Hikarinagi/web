import { useMediaQuery } from '@vueuse/core'
import type { MangaReadingUnit } from '@hikarinagi/shared'
import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
import type { MangaReaderFit } from '../lib/settings'
import { useMangaReader } from './useMangaReader'
import { usePageLoader } from './usePageLoader'
import { useReaderSettings } from './useReaderSettings'

interface UseReaderViewOptions {
  data: () => MangaReadPageData
  unit: () => MangaReadingUnit
  openNext: () => void
}

export function useReaderView(options: UseReaderViewOptions) {
  const manifest = computed(() => options.data().manifest)
  const manga = manifest.value.manga
  const { settings, mode, direction } = useReaderSettings({
    mangaId: manga.id,
    webtoon: manga.reading_mode === 'WEBTOON',
    ltr: manga.reading_mode === 'PAGED_LTR',
  })
  const mounted = useMounted()
  const narrowViewport = useMediaQuery('(max-width: 767px)')
  const narrow = computed(() => mounted.value && narrowViewport.value)
  const paged = computed(() => mode.value === 'paged')
  const double = computed(
    () =>
      !narrow.value &&
      (settings.value.layout === 'double' ||
        (settings.value.layout === 'auto' && options.unit() === 'volume')),
  )
  const fit = computed<MangaReaderFit>(() => (narrow.value ? 'screen' : settings.value.fit))
  const shift = ref(false)

  const reader = useMangaReader({
    pages: () => manifest.value.pages,
    layout: () => (double.value ? 'double' : 'single'),
    coverAlone: () => settings.value.cover_alone,
    shift: () => shift.value,
    initialPage: manifest.value.progress_page,
    hasNext: () => !!manifest.value.next_chapter,
    onEnterInterlude: () => {},
    onAdvancePastInterlude: options.openNext,
  })
  const loader = usePageLoader({
    pages: () => manifest.value.pages,
    manga: () => manifest.value.manga.id,
    chapter: () => manifest.value.chapter.id,
  })

  const scrollPage = ref(manifest.value.progress_page ?? 1)
  const scrollEnded = ref(false)
  const shown = computed(() => {
    if (!paged.value) return [scrollPage.value]
    const pages = reader.currentSpread.value?.pages ?? []
    return pages.length ? pages.map(page => page.page_number) : [reader.totalPages.value]
  })
  const visiblePage = computed(() => {
    if (paged.value) return reader.maxVisiblePage.value
    return scrollEnded.value ? reader.totalPages.value : scrollPage.value
  })

  function spreadOf(page: number) {
    if (!paged.value) return [page]
    const spread = reader.spreads.value.find(item =>
      item.pages.some(entry => entry.page_number === page),
    )
    return spread?.pages.map(entry => entry.page_number) ?? [page]
  }

  function toggleDouble() {
    settings.value = { ...settings.value, layout: double.value ? 'single' : 'double' }
  }

  watch(shown, pages => loader.ensureAround(pages))
  onMounted(() => loader.ensureAround(shown.value))

  return {
    direction,
    settings,
    mode,
    narrow,
    paged,
    double,
    fit,
    shift,
    reader,
    loader,
    scrollPage,
    scrollEnded,
    shown,
    visiblePage,
    spreadOf,
    toggleDouble,
  }
}
