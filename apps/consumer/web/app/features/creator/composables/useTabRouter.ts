import type { RouteLocationNormalized } from 'vue-router'

export function useTabRouter() {
  if (import.meta.server) return
  const store = useCreatorTabsStore()
  const router = useRouter()
  const visit = (location: RouteLocationNormalized) => {
    if (location.meta.layout !== 'creator') return
    store.visit(location.fullPath, (location.meta.title as string | undefined) ?? '创作者中心')
  }

  const stop = router.afterEach((to, _from, failure) => {
    if (!failure) visit(to)
  })
  onMounted(() => visit(router.currentRoute.value))
  onScopeDispose(stop)
}
