<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { appFormOf, DEVELOPER_APP_FORMS } from '~/features/developer/appForms'
  import {
    developerAppResolver,
    type DeveloperAppValues,
  } from '~/features/developer/schemas/app.schema'

  defineOptions({ name: 'DeveloperConsoleCreateDialog' })

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    created: [secret: { client_id: string; client_secret: string | null }]
  }>()

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
    :style="{ width: '92vw', maxWidth: '32rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      :initial-values="{ form: 'server' }"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="client_name" label="应用名称" required>
        <InputText :id="id" autocomplete="off" fluid placeholder="如：我的收藏同步工具" />
      </FormItem>

      <FormItem v-slot="{ field }" name="form" label="应用形态" required>
        <div class="flex flex-col gap-2">
          <label
            v-for="option in DEVELOPER_APP_FORMS"
            :key="option.value"
            class="flex cursor-pointer items-start gap-2.5 rounded-lg border border-surface p-3 transition-colors hover:bg-emphasis"
            :class="field.value === option.value ? 'border-hikari-primary-500' : ''"
          >
            <RadioButton
              :model-value="field.value"
              :value="option.value"
              :aria-label="option.label"
              @update:model-value="field.props.onInput({ value: option.value })"
            />
            <span class="flex min-w-0 flex-col gap-1">
              <span class="text-sm font-medium text-color">{{ option.label }}</span>
              <span class="text-xs leading-relaxed text-muted-color">{{ option.hint }}</span>
            </span>
          </label>
        </div>
      </FormItem>

      <p class="text-xs leading-relaxed text-muted-color">
        创建后可在应用设置中调整形态、回调地址与权限范围。
      </p>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="创建" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
