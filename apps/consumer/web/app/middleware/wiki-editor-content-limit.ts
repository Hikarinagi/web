import { useAuthSession } from '~/features/auth/composables/useAuthSession'
import { NEVER_SHOW_NSFW } from '~/features/nsfw/composables/useNsfwPolicy'

const CONFIRM_PATH = '/create/edit/content-limit'
const FALLBACK_PATH = '/create/edit'

export default defineNuxtRouteMiddleware(async to => {
  if (to.path === CONFIRM_PATH) return

  const auth = useAuthStore()
  const { ensureLoaded } = useAuthSession()

  await ensureLoaded()

  if (!auth.user || auth.user.content_limit !== NEVER_SHOW_NSFW) return

  return navigateTo({
    path: CONFIRM_PATH,
    query: { redirect_to: to.fullPath || FALLBACK_PATH },
  })
})
