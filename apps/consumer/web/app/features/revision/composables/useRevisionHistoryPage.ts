import type { RevisionHistoryPageData } from '~~/server/api/pages/revisions/[type]/[id].get'
import type { RevisionResourceSlug } from '~/features/revision/resources'

export async function useRevisionHistoryPage(type: RevisionResourceSlug) {
  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const id = Number(rawId)
  const page = ref(Number(route.query.page) || 1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/revisions/${type}/${id}?page=${page.value}`,
  )
  const { data, pending } = await useHikariApiData<RevisionHistoryPageData>(requestUrl, {
    fatal: true,
  })

  watch(
    () => route.query.page,
    rawPage => {
      const nextPage = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage) || 1
      if (page.value !== nextPage) page.value = nextPage
    },
  )

  return { data, page, pending }
}
