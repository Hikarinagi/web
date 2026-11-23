import { shelfSets, type LightNovelVolumeSet } from '~/features/light-novel/sets'
import { useSetChoice } from '~/features/volume-set/composables/useSetChoice'

export function useShelfSet(
  source: () => { volumes: LightNovelVolumeSet['volumes']; sets: LightNovelVolumeSet[] },
  chosen: Ref<number | null>,
) {
  const options = computed(() => shelfSets(source().sets))
  const { option, model } = useSetChoice(() => options.value, chosen)
  const volumes = computed(
    () => source().sets.find(set => set.id === option.value?.value)?.volumes ?? source().volumes,
  )
  return { options, model, volumes }
}
