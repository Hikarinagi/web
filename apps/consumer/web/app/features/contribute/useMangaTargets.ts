import type {
  MangaTargetChapter,
  MangaTargetClaim,
  MangaTargetSet,
  MangaTargetVolume,
} from './manga-target'

export function useMangaTargets(
  seriesId: () => number | null,
  volumeId: () => number | null = () => null,
) {
  const chapters = shallowRef<MangaTargetChapter[]>([])
  const volumes = shallowRef<MangaTargetVolume[]>([])
  const sets = shallowRef<MangaTargetSet[]>([])
  const chosen = ref<number | null>(null)
  const claims = shallowRef<MangaTargetClaim[]>([])
  const published = shallowRef<MangaTargetClaim[]>([])
  const loading = ref(false)

  async function load(id: number, set: number | null) {
    const entries = await hikariRequest('/api/v3/mangas/{id}/volumes/contents', {
      path: { id },
      query: set === null ? {} : { set_entry_id: set },
      toast: false,
    }).catch(() => null)
    if (seriesId() === id && chosen.value === set) volumes.value = entries ?? []
  }

  const setId = computed<number | null>({
    get: () => chosen.value,
    set: next => {
      chosen.value = next
      const id = seriesId()
      if (id) void load(id, next)
    },
  })

  watch(
    seriesId,
    async id => {
      chapters.value = []
      volumes.value = []
      sets.value = []
      chosen.value = null
      claims.value = []
      published.value = []
      if (!id) return
      loading.value = true
      const [list, shelves, projects, uploads] = await Promise.all([
        hikariRequest('/api/v3/mangas/{id}/chapters', {
          path: { id },
          query: { wanted: true },
          toast: false,
        }).catch(() => null),
        hikariRequest('/api/v3/mangas/{id}/sets', { path: { id }, toast: false }).catch(() => null),
        hikariRequest('/api/v3/manga-projects', {
          query: { series_id: id, status: ['ACTIVE', 'REVIEW'], page: 1, page_size: 50 },
          toast: false,
        }).catch(() => null),
        hikariRequest('/api/v3/manga-projects', {
          query: { series_id: id, status: ['PUBLISHED'], page: 1, page_size: 100 },
          toast: false,
        }).catch(() => null),
      ])
      if (seriesId() !== id) return
      chapters.value = [...(list ?? [])].reverse()
      sets.value = shelves ?? []
      const fixed = volumeId()
      chosen.value =
        sets.value.find(set => set.volumes.some(volume => volume.id === fixed))?.id ??
        sets.value.find(set => set.original)?.id ??
        null
      claims.value = projects?.items ?? []
      published.value = uploads?.items ?? []
      await load(id, chosen.value)
      loading.value = false
    },
    { immediate: true },
  )

  return { chapters, volumes, sets, setId, claims, published, loading }
}
