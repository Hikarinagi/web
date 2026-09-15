<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, RadioGroup } from '@hina-ui/vue'
  import { appFormOf, DEVELOPER_APP_FORMS } from '~/features/developer/appForms'
  import {
    developerAppSchema,
    type DeveloperAppValues,
  } from '~/features/developer/schemas/app.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'DeveloperConsoleCreateDialog' })

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    created: [secret: { client_id: string; client_secret: string | null }]
  }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const formOptions = DEVELOPER_APP_FORMS.map(option => ({
    value: option.value,
    label: option.label,
    description: option.hint,
  }))
  const values = reactive<DeveloperAppValues>({ client_name: '', form: 'server' })
  const submitting = ref(false)

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.client_name = ''
    values.form = 'server'
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const shape = appFormOf(values.form)
      const created = await hikariRequest<'/api/v3/user/me/developer/apps', 'post'>(
        '/api/v3/user/me/developer/apps',
        {
          method: 'POST',
          body: {
            client_name: values.client_name,
            client_type: shape.client_type,
            application_type: shape.application_type,
          },
        },
      )
      emit('created', { client_id: created.client_id, client_secret: created.client_secret })
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="创建应用" size="lg" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="developerAppSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="client_name" label="应用名称" required>
          <Input
            v-model="values.client_name"
            autocomplete="off"
            placeholder="如：我的收藏同步工具"
          />
        </FormField>

        <FormField
          name="form"
          label="应用形态"
          required
          description="创建后可在应用设置中调整形态、回调地址与权限范围。"
        >
          <RadioGroup v-model="values.form" :options="formOptions" block />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">创建</Button>
    </template>
  </Dialog>
</template>
