<script setup lang="ts">
  import Form from '@primevue/forms/form'
  import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
  import { push } from 'notivue'
  import { nicknameResolver, type NicknameValues } from '~/features/space/schemas/setting.schema'

  const auth = useAuthStore()
  const dismissed = useLocalStorage('hikari-nickname-prompt-dismissed', false)
  const open = ref(false)
  const submitting = ref(false)
  const formErrors = useFormErrors(nicknameResolver)
  const form = useTemplateRef<FormInstance>('form')

  const needsNickname = computed(() => {
    const u = auth.user
    return !!u && (!u.nickname || u.nickname === u.name)
  })

  function maybeShow() {
    if (auth.loaded && needsNickname.value && !dismissed.value) open.value = true
  }

  onMounted(maybeShow)
  watch(() => [auth.loaded, auth.user?.id], maybeShow)

  async function submit(event: FormSubmitEvent) {
    const u = auth.user
    if (!event.valid || submitting.value || !u) return
    submitting.value = true
    try {
      const { nickname } = event.values as NicknameValues
      const updated = await hikariRequest<'/api/v3/user/me', 'patch'>('/api/v3/user/me', {
        method: 'PATCH',
        body: {
          nickname,
          signature: u.signature ?? null,
          bio: u.bio ?? null,
          avatar_id: u.avatar?.id ?? null,
          head_cover_id: u.head_cover?.id ?? null,
        },
      })
      auth.setUser(updated)
      push.success({ message: '昵称已设置' })
      open.value = false
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="open"
    modal
    dismissable-mask
    close-on-escape
    :draggable="false"
    header="想起个昵称吗？"
    :style="{ width: '24rem' }"
    @hide="dismissed = true"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      :initial-values="{ nickname: '' }"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="submit"
    >
      <FormItem v-slot="{ id, errorId }" name="nickname" label="昵称">
        <InputText
          :id="id"
          :aria-describedby="errorId"
          fluid
          autocomplete="off"
          maxlength="32"
          placeholder="给自己起个名字"
        />
        <p class="text-xs text-muted-color">你的昵称将会在所有地方展示，随时可以在个人设置里修改</p>
      </FormItem>

      <div class="flex justify-end gap-2">
        <Button
          label="以后再说"
          type="button"
          text
          severity="secondary"
          :disabled="submitting"
          @click="open = false"
        />
        <Button label="保存" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
