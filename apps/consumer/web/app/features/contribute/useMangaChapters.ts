import type { MangaTargetChapter, MangaTargetClaim } from './manga-target'

export function useMangaChapters(seriesId: () => number | null) {
  const chapters = shallowRef<MangaTargetChapter[]>([])
  const claims = shallowRef<MangaTargetClaim[]>([])
  const loading = ref(false)

  watch(
    seriesId,
    async id => {
      chapters.value = []
      claims.value = []
      if (!id) return
      loading.value = true
      const [list, projects] = await Promise.all([
        hikariRequest('/api/v3/mangas/{id}/chapters', {
          path: { id },
          query: { wanted: true },
          toast: false,
        }).catch(() => null),
        hikariRequest('/api/v3/manga-projects', {
          query: { series_id: id, status: ['DRAFT', 'ACTIVE', 'REVIEW'], page: 1, page_size: 50 },
          toast: false,
        }).catch(() => null),
      ])
      if (seriesId() !== id) return
      chapters.value = (list ?? [])
        .filter(chapter => !chapter.page_count)
        .sort((left, right) => right.sort_key - left.sort_key)
      claims.value = projects?.items ?? []
      loading.value = false
    },
    { immediate: true },
  )

  return { chapters, claims, loading }
}
