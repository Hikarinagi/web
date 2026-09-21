<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input } from '@hina-ui/vue'
  import { push } from 'notivue'
  import { nicknameSchema } from '~/features/space/schemas/setting.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const auth = useAuthStore()
  const dismissed = useLocalStorage('hikari-nickname-prompt-dismissed', false)
  const open = ref(false)
  const submitting = ref(false)
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ nickname: '' })

  const needsNickname = computed(() => {
    const u = auth.user
    return !!u && (!u.nickname || u.nickname === u.name)
  })

  function maybeShow() {
    if (auth.loaded && needsNickname.value && !dismissed.value) open.value = true
  }

  onMounted(maybeShow)
  watch(() => [auth.loaded, auth.user?.id], maybeShow)

  watch(open, next => {
    if (next) return
    dismissed.value = true
    form.value?.reset()
    values.nickname = ''
  })

  async function onSubmit() {
    const u = auth.user
    if (submitting.value || !u) return
    submitting.value = true
    try {
      const updated = await hikariRequest<'/api/v3/user/me', 'patch'>('/api/v3/user/me', {
        method: 'PATCH',
        body: {
          nickname: values.nickname.trim(),
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
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="想起个昵称吗？" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="nicknameSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField
          name="nickname"
          label="昵称"
          description="你的昵称将会在所有地方展示，随时可以在个人设置里修改"
          description-placement="control"
        >
          <Input
            v-model="values.nickname"
            autocomplete="off"
            maxlength="32"
            placeholder="给自己起个名字"
          />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        以后再说
      </Button>
      <Button :loading="submitting" @click="form?.submit()">保存</Button>
    </template>
  </Dialog>
</template>
