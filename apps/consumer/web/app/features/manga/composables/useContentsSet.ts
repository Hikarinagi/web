import type { ContentsItem } from '~/features/manga/contents'
import { contentsSets, type MangaVolumeSet } from '~/features/manga/sets'
import { useSetChoice } from '~/features/volume-set/composables/useSetChoice'

export function useContentsSet(
  source: () => { chapters: ContentsItem[]; sets: MangaVolumeSet[] },
  chosen: Ref<number | null>,
) {
  const options = computed(() => contentsSets(source().chapters, source().sets))
  const { option, model } = useSetChoice(() => options.value, chosen)
  const key = computed(() => option.value?.key ?? null)
  return { options, key, model }
}
