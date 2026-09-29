export function useContributeKind() {
  const route = useRoute()
  const router = useRouter()

  return computed<'novel' | 'manga'>({
    get: () => {
      if (route.query.kind === 'manga' || route.query.kind === 'novel') return route.query.kind
      return route.query.manga ? 'manga' : 'novel'
    },
    set: value => void router.replace({ query: { ...route.query, kind: value } }),
  })
}
