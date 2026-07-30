<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import {
    developerAppResolver,
    type DeveloperAppValues,
  } from '~/features/developer/schemas/app.schema'

  defineOptions({ name: 'DeveloperConsoleCreateDialog' })

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ created: [secret: { client_id: string; client_secret: string }] }>()

  const formErrors = useFormErrors(developerAppResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  watch(visible, next => {
    if (next) {
      formErrors.clear()
      form.value?.reset()
    }
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as DeveloperAppValues
      const created = await hikariRequest<'/api/v3/user/me/developer/apps', 'post'>(
        '/api/v3/user/me/developer/apps',
        { method: 'POST', body: { client_name: values.client_name } },
      )
      emit('created', { client_id: created.client_id, client_secret: created.client_secret })
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="创建应用"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '28rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="client_name" label="应用名称" required>
        <InputText :id="id" autocomplete="off" fluid placeholder="如：我的收藏同步工具" />
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="创建" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
