import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { CurrentUser } from '~/types/auth'

type UserContentLimit = CurrentUser['content_limit']

export const DEFAULT_CONTENT_LIMIT: UserContentLimit = 'NEVER_SHOW_NSFW_CONTENT'
export const NEVER_SHOW_NSFW: UserContentLimit = 'NEVER_SHOW_NSFW_CONTENT'
export const SHOW_NSFW_WITH_SPOILER: UserContentLimit = 'SHOW_WITH_SPOILER'
export const JUST_SHOW_NSFW: UserContentLimit = 'JUST_SHOW'

function hasNsfw(value: MaybeRefOrGetter<boolean | null | undefined>) {
  return toValue(value) === true
}

export function useNsfwPolicy() {
  const auth = useAuthStore()
  const contentLimit = computed<UserContentLimit>(
    () => auth.user?.content_limit ?? DEFAULT_CONTENT_LIMIT,
  )

  function shouldBlockNsfw(nsfw: MaybeRefOrGetter<boolean | null | undefined>) {
    return hasNsfw(nsfw) && contentLimit.value === NEVER_SHOW_NSFW
  }

  function shouldBlurNsfw(nsfw: MaybeRefOrGetter<boolean | null | undefined>) {
    return hasNsfw(nsfw) && contentLimit.value === SHOW_NSFW_WITH_SPOILER
  }

  return { contentLimit, shouldBlockNsfw, shouldBlurNsfw }
}

export function useNsfwDetailGate(nsfw: MaybeRefOrGetter<boolean | null | undefined>) {
  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(() => shouldBlockNsfw(nsfw))

  function fail() {
    const error = createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
    if (import.meta.server) throw error
    showError(error)
  }

  if (blocked.value) fail()

  if (import.meta.client) {
    watch(blocked, isBlocked => {
      if (isBlocked) fail()
    })
  }

  return { blocked }
}
