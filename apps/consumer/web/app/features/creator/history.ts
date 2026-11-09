import type { NavigationFailure, Router } from 'vue-router'

const loaded = import.meta.client ? Number(window.history.state?.position ?? 0) : 0

export function previousPath(): string | null {
  const state = import.meta.client ? window.history.state : null
  if (typeof state?.back !== 'string' || Number(state.position) - 1 < loaded) return null
  return state.back as string
}

export function goBack(router: Router) {
  return new Promise<NavigationFailure | undefined>(resolve => {
    const stop = router.afterEach((_to, _from, failure) => {
      stop()
      resolve(failure ?? undefined)
    })
    router.back()
  })
}
