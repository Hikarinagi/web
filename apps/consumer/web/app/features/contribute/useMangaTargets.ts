import type { MangaTargetChapter, MangaTargetClaim, MangaTargetVolume } from './manga-target'

export function useMangaTargets(seriesId: () => number | null) {
  const chapters = shallowRef<MangaTargetChapter[]>([])
  const volumes = shallowRef<MangaTargetVolume[]>([])
  const claims = shallowRef<MangaTargetClaim[]>([])
  const loading = ref(false)

  watch(
    seriesId,
    async id => {
      chapters.value = []
      volumes.value = []
      claims.value = []
      if (!id) return
      loading.value = true
      const [list, entries, projects] = await Promise.all([
        hikariRequest('/api/v3/mangas/{id}/chapters', {
          path: { id },
          query: { wanted: true },
          toast: false,
        }).catch(() => null),
        hikariRequest('/api/v3/mangas/{id}/volumes', { path: { id }, toast: false }).catch(
          () => null,
        ),
        hikariRequest('/api/v3/manga-projects', {
          query: { series_id: id, status: ['DRAFT', 'ACTIVE', 'REVIEW'], page: 1, page_size: 50 },
          toast: false,
        }).catch(() => null),
      ])
      if (seriesId() !== id) return
      chapters.value = [...(list ?? [])].sort((left, right) => right.sort_key - left.sort_key)
      volumes.value = entries ?? []
      claims.value = projects?.items ?? []
      loading.value = false
    },
    { immediate: true },
  )

  return { chapters, volumes, claims, loading }
}
