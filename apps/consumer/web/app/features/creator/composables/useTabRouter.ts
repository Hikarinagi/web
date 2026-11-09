import type { RouteLocationNormalized } from 'vue-router'

export function useTabRouter() {
  if (import.meta.server) return
  const store = useCreatorTabsStore()
  const router = useRouter()
  const visit = (location: RouteLocationNormalized, from: string) => {
    if (location.meta.layout !== 'creator') return
    store.visit(
      location.fullPath,
      (location.meta.title as string | undefined) ?? '创作者中心',
      from,
    )
  }

  const stopListen = router.options.history.listen(to => store.expect(to, 'restore'))
  const stopAfter = router.afterEach((to, from, failure) => {
    if (!failure) visit(to, from.fullPath)
  })
  onMounted(() => visit(router.currentRoute.value, ''))
  onScopeDispose(() => {
    stopListen()
    stopAfter()
  })
}
