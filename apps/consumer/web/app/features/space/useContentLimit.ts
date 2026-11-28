import { toast } from '@hina-ui/vue'
import type { ContentLimit, ContentLimits } from '~/utils/media/image'
import { strictestLimit } from '~/utils/media/image'

export function useContentLimit(initial: ContentLimits) {
  const auth = useAuthStore()
  const { sexual_1_limit, sexual_2_limit, violence_1_limit, violence_2_limit } = initial
  const selected = ref<ContentLimits>({
    sexual_1_limit,
    sexual_2_limit,
    violence_1_limit,
    violence_2_limit,
  })
  const current = ref<ContentLimits>({ ...selected.value })
  const saving = ref(false)

  async function save(kind: 'sexual' | 'violence', level: 1 | 2, value: ContentLimit) {
    const field = `${kind}_${level}_limit` as const
    const higher = `${kind}_2_limit` as const
    if (saving.value || value === selected.value[field]) return
    const next = { ...selected.value, [field]: value }
    if (level === 1) next[higher] = strictestLimit(value, next[higher])
    selected.value = next
    saving.value = true
    try {
      await hikariRequest<'/api/v3/user/me/settings', 'patch'>('/api/v3/user/me/settings', {
        method: 'PATCH',
        body: next,
      })
      const user = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(user)
      current.value = next
      toast.success(translate('setting.contentLimit.saved'))
    } catch {
      selected.value = current.value
    } finally {
      saving.value = false
    }
  }

  return { selected, saving, save }
}
