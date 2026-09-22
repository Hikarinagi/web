import type { Form } from '@hina-ui/vue'
import { toast } from '@hina-ui/vue'
import type { MediaValue } from '~/components/media-library/types'
import type { CurrentUser } from '~/types/auth'
import { getFieldErrors } from '~/utils/api/error'

const toMedia = (asset: CurrentUser['avatar']): MediaValue | null =>
  asset ? { id: asset.id, src: asset.src, width: asset.width, height: asset.height } : null

export function useProfileForm(user: CurrentUser) {
  const auth = useAuthStore()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)

  const avatar = ref<MediaValue | null>(toMedia(user.avatar))
  const headCover = ref<MediaValue | null>(toMedia(user.head_cover))
  const values = reactive({
    nickname: user.nickname ?? '',
    signature: user.signature ?? '',
    bio: user.bio ?? '',
  })

  function reset() {
    form.value?.reset()
    values.nickname = user.nickname ?? ''
    values.signature = user.signature ?? ''
    values.bio = user.bio ?? ''
    avatar.value = toMedia(user.avatar)
    headCover.value = toMedia(user.head_cover)
  }

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const updated = await hikariRequest<'/api/v3/user/me', 'patch'>('/api/v3/user/me', {
        method: 'PATCH',
        body: {
          nickname: values.nickname.trim() || null,
          signature: values.signature.trim() || null,
          bio: values.bio.trim() || null,
          avatar_id: avatar.value?.id ?? null,
          head_cover_id: headCover.value?.id ?? null,
        },
      })
      auth.setUser(updated)
      toast.success('资料已更新')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }

  return { form, values, submitting, avatar, headCover, submit, reset }
}
