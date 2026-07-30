<script setup lang="ts">
  import Form from '@primevue/forms/form'
  import { useChangeUsernameForm } from '~/features/user/useChangeUsernameForm'

  defineOptions({ name: 'UserChangeUsernameDialog' })

  const {
    current,
    intro,
    dismissableMask = true,
  } = defineProps<{ current: string; intro?: string; dismissableMask?: boolean }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { form, formErrors, submitting, confirmed, submit, reset } = useChangeUsernameForm(() => {
    visible.value = false
  })

  watch(visible, open => {
    if (!open) reset()
  })
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="修改用户名"
    :style="{ width: '28rem' }"
    :dismissable-mask="dismissableMask && !submitting"
    :close-on-escape="dismissableMask && !submitting"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-5"
      @input="formErrors.clear"
      @submit="submit"
    >
      <p v-if="intro" class="text-sm text-muted-color">{{ intro }}</p>

      <Message severity="warn" :closable="false" size="small">
        用户名只能修改一次,且无法撤销。请谨慎决定。
      </Message>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-color">当前用户名</label>
        <InputText :model-value="current" disabled fluid />
      </div>

      <FormItem v-slot="{ id, errorId }" name="username" label="新用户名" required>
        <InputText
          :id="id"
          :aria-describedby="errorId"
          fluid
          autocomplete="off"
          placeholder="字母、数字、下划线,3-20 位"
        />
      </FormItem>

      <div class="flex items-start gap-2">
        <Checkbox v-model="confirmed" input-id="confirm-username-change" binary />
        <label for="confirm-username-change" class="text-sm text-muted-color">
          我已知晓用户名只能修改一次，确认后无法再次更改
        </label>
      </div>

      <div class="flex justify-end gap-3">
        <Button
          label="取消"
          severity="secondary"
          variant="text"
          :disabled="submitting"
          @click="visible = false"
        />
        <Button label="确认修改" type="submit" :loading="submitting" :disabled="!confirmed" />
      </div>
    </Form>
  </Dialog>
</template>
