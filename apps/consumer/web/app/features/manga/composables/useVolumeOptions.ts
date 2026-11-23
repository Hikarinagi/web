import type { SelectItems } from '@hina-ui/vue'
import { mangaSetName } from '@hikarinagi/shared'
import { getMangaVolumeLabel } from '~/utils/media/manga'

export function useVolumeOptions(seriesId: MaybeRefOrGetter<number | null>) {
  const options = shallowRef<SelectItems>([])
  const loading = ref(false)

  watch(
    () => toValue(seriesId),
    async id => {
      options.value = []
      if (!id) return
      loading.value = true
      const sets = await hikariRequest('/api/v3/mangas/{id}/sets', {
        path: { id },
        toast: false,
      }).catch(() => [])
      const volumes =
        sets.length === 1
          ? sets[0]!.volumes
          : sets.length
            ? []
            : await hikariRequest('/api/v3/mangas/{id}/volumes', {
                path: { id },
                toast: false,
              }).catch(() => [])
      if (toValue(seriesId) !== id) return
      const choices = (list: typeof volumes) =>
        list.map(volume => ({ value: volume.id, label: getMangaVolumeLabel(volume) }))
      options.value =
        sets.length > 1
          ? sets.map(set => ({ label: mangaSetName(set), options: choices(set.volumes) }))
          : choices(volumes)
      loading.value = false
    },
    { immediate: true },
  )

  return { options, loading }
}
