<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import type { MediaValue } from '~/components/media-library/types'
  import {
    developerAppProfileResolver,
    type DeveloperAppProfileValues,
  } from '~/features/developer/schemas/app.schema'

  defineOptions({ name: 'DeveloperConsoleAppProfilePanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const formErrors = useFormErrors(developerAppProfileResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)
  const logo = ref<MediaValue | null | undefined>()

  const logoSrc = computed(() =>
    logo.value === undefined ? props.app.logo : (logo.value?.src ?? null),
  )

  const initialValues = computed(() => ({
    client_name: props.app.client_name,
    client_uri: props.app.client_uri ?? '',
  }))

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as DeveloperAppProfileValues
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'patch'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        {
          method: 'patch',
          path: { client_id: props.app.client_id },
          body: {
            client_name: values.client_name,
            client_uri: values.client_uri?.length ? values.client_uri : null,
            ...(logo.value === undefined ? {} : { logo_id: logo.value?.id ?? null }),
          },
        },
      )
      logo.value = undefined
      push.success({ message: '应用信息已更新' })
      emit('changed')
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <section class="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
    <h3 class="text-sm font-semibold text-color">基本信息</h3>
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      :initial-values="initialValues"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <DeveloperConsoleAppIconField
        :src="logoSrc"
        :name="app.client_name"
        @picked="media => (logo = media)"
      />

      <FormItem v-slot="{ id }" name="client_name" label="应用名称" required>
        <InputText :id="id" autocomplete="off" fluid />
      </FormItem>

      <FormItem v-slot="{ id }" name="client_uri" label="主页地址">
        <InputText :id="id" autocomplete="off" fluid placeholder="https://" />
      </FormItem>

      <div class="flex justify-end">
        <Button label="保存" type="submit" :loading="submitting" />
      </div>
    </Form>
  </section>
</template>
