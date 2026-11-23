import type { ContentsItem } from '~/features/manga/contents'
import { contentsSetKey, contentsSets, type MangaVolumeSet } from '~/features/manga/sets'

export function useContentsSet(
  source: () => { chapters: ContentsItem[]; sets: MangaVolumeSet[] },
  chosen: Ref<number | null>,
) {
  const options = computed(() => contentsSets(source().chapters, source().sets))
  const key = computed(() => contentsSetKey(options.value, chosen.value))
  const model = computed<number | null>({
    get: () => options.value.find(option => option.key === key.value)?.value ?? null,
    set: value => {
      chosen.value = value
    },
  })
  return { options, key, model }
}

export function useRouteSet() {
  const route = useRoute()
  const router = useRouter()
  return computed<number | null>({
    get: () => {
      const value = Number(route.query.set)
      return Number.isSafeInteger(value) && value > 0 ? value : null
    },
    set: value => {
      void router.replace({
        query: { ...route.query, set: value === null ? undefined : String(value) },
      })
    },
  })
}
