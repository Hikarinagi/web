import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { ContentLimits, HikariImageSafety } from '~/utils/media/image'
import { imageLimit } from '~/utils/media/image'

const GUEST_LIMITS: ContentLimits = {
  sexual_1_limit: 'NEVER_SHOW_NSFW_CONTENT',
  sexual_2_limit: 'NEVER_SHOW_NSFW_CONTENT',
  violence_1_limit: 'NEVER_SHOW_NSFW_CONTENT',
  violence_2_limit: 'NEVER_SHOW_NSFW_CONTENT',
}

export function useNsfwPolicy() {
  const auth = useAuthStore()
  const limits = computed<ContentLimits>(() => auth.user ?? GUEST_LIMITS)

  function shouldBlockNsfw(nsfw: MaybeRefOrGetter<boolean | null | undefined>) {
    return toValue(nsfw) === true && limits.value.sexual_2_limit === 'NEVER_SHOW_NSFW_CONTENT'
  }

  function limitOf(safety: HikariImageSafety) {
    return imageLimit(safety, limits.value)
  }

  return { shouldBlockNsfw, limitOf }
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
