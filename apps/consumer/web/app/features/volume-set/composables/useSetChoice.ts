import { chosenSetOption, type VolumeSetOption } from '~/features/volume-set/sets'

export function useSetChoice(options: () => VolumeSetOption[], chosen: Ref<number | null>) {
  const option = computed(() => chosenSetOption(options(), chosen.value))
  const model = computed<number | null>({
    get: () => option.value?.value ?? null,
    set: value => {
      chosen.value = value
    },
  })
  return { option, model }
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
