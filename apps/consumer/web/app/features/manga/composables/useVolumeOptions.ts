import { getMangaVolumeLabel } from '~/utils/media/manga'

export function useVolumeOptions(seriesId: MaybeRefOrGetter<number | null>) {
  const options = shallowRef<{ value: number; label: string }[]>([])
  const loading = ref(false)

  watch(
    () => toValue(seriesId),
    async id => {
      options.value = []
      if (!id) return
      loading.value = true
      const volumes = await hikariRequest('/api/v3/mangas/{id}/volumes', {
        path: { id },
        toast: false,
      }).catch(() => [])
      if (toValue(seriesId) !== id) return
      options.value = volumes.map(volume => ({
        value: volume.id,
        label: getMangaVolumeLabel(volume),
      }))
      loading.value = false
    },
    { immediate: true },
  )

  return { options, loading }
}
