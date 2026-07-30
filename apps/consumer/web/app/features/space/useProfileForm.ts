import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
import { push } from 'notivue'
import type { MediaValue } from '~/components/media-library/types'
import { profileResolver, type ProfileValues } from './schemas/setting.schema'
import type { CurrentUser } from '~/types/auth'

const toMedia = (asset: CurrentUser['avatar']): MediaValue | null =>
  asset ? { id: asset.id, src: asset.src, width: asset.width, height: asset.height } : null

export function useProfileForm(user: CurrentUser) {
  const auth = useAuthStore()
  const formErrors = useFormErrors(profileResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  const avatar = ref<MediaValue | null>(toMedia(user.avatar))
  const headCover = ref<MediaValue | null>(toMedia(user.head_cover))

  const initialValues = computed(() => ({
    nickname: user.nickname ?? '',
    signature: user.signature ?? '',
    bio: user.bio ?? '',
  }))

  function reset() {
    form.value?.reset()
    formErrors.clear()
    avatar.value = toMedia(user.avatar)
    headCover.value = toMedia(user.head_cover)
  }

  async function submit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const v = event.values as ProfileValues
      const updated = await hikariRequest<'/api/v3/user/me', 'patch'>('/api/v3/user/me', {
        method: 'PATCH',
        body: {
          nickname: v.nickname?.length ? v.nickname : null,
          signature: v.signature?.length ? v.signature : null,
          bio: v.bio?.length ? v.bio : null,
          avatar_id: avatar.value?.id ?? null,
          head_cover_id: headCover.value?.id ?? null,
        },
      })
      auth.setUser(updated)
      push.success({ message: '资料已更新' })
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }

  return { formErrors, submitting, avatar, headCover, initialValues, submit, reset }
}
