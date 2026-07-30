import { useAuthSession } from '~/features/auth/composables/useAuthSession'

export default defineNuxtRouteMiddleware(async to => {
  const auth = useAuthStore()
  const { ensureLoaded } = useAuthSession()

  await ensureLoaded()

  if (auth.isAuthenticated) return

  return navigateTo({
    path: '/login',
    query: { redirect_to: to.fullPath || '/' },
  })
})
