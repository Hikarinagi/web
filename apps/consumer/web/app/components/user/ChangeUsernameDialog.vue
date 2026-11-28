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

  const { t } = useLocaleText()
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
    :title="t('setting.username.title')"
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

        <Alert tone="warning">{{ t('setting.username.warning') }}</Alert>

        <FormField :label="t('setting.username.current')">
          <Input :model-value="current" disabled />
        </FormField>

        <FormField name="username" :label="t('setting.username.next')" required>
          <Input
            v-model="values.username"
            autocomplete="off"
            :placeholder="t('setting.username.placeholder')"
          />
        </FormField>

        <Checkbox v-model="confirmed">{{ t('setting.username.confirm') }}</Checkbox>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        {{ t('common.cancel') }}
      </Button>
      <Button :loading="submitting" :disabled="!confirmed" @click="form?.submit()">
        {{ t('setting.username.submit') }}
      </Button>
    </template>
  </Dialog>
</template>
