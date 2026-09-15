<script setup lang="ts">
  import { Alert, Button, Checkbox, Dialog, Form, FormField, Input, Text } from '@hina-ui/vue'
  import { usernameSchema } from '~/features/user/schemas/username.schema'
  import { useChangeUsernameForm } from '~/features/user/useChangeUsernameForm'

  defineOptions({ name: 'UserChangeUsernameDialog' })

  const {
    current,
    intro,
    dismissableMask = true,
  } = defineProps<{ current: string; intro?: string; dismissableMask?: boolean }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { form, values, submitting, confirmed, submit, reset } = useChangeUsernameForm(() => {
    visible.value = false
  })

  watch(visible, open => {
    if (!open) reset()
  })
</script>

<template>
  <Dialog
    v-model:open="visible"
    title="修改用户名"
    size="md"
    :locked="!dismissableMask || submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="usernameSchema"
        :disabled="submitting"
        @submit="submit"
      >
        <Text v-if="intro" size="sm" tone="muted">{{ intro }}</Text>

        <Alert tone="warning">用户名只能修改一次，且无法撤销。请谨慎决定。</Alert>

        <FormField label="当前用户名">
          <Input :model-value="current" disabled />
        </FormField>

        <FormField name="username" label="新用户名" required>
          <Input
            v-model="values.username"
            autocomplete="off"
            placeholder="字母、数字、下划线，3-20 位"
          />
        </FormField>

        <Checkbox v-model="confirmed">我已知晓用户名只能修改一次，确认后无法再次更改</Checkbox>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" :disabled="!confirmed" @click="form?.submit()">确认修改</Button>
    </template>
  </Dialog>
</template>
