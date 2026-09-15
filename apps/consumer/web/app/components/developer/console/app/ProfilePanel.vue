<script setup lang="ts">
  import { Button, Form, FormField, Heading, Inline, Input, Section, Stack } from '@hina-ui/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import type { MediaValue } from '~/components/media-library/types'
  import {
    developerAppProfileSchema,
    type DeveloperAppProfileValues,
  } from '~/features/developer/schemas/app.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'DeveloperConsoleAppProfilePanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const logo = ref<MediaValue | null | undefined>()

  const logoSrc = computed(() =>
    logo.value === undefined ? props.app.logo : (logo.value?.src ?? null),
  )

  const values = reactive<DeveloperAppProfileValues>({
    client_name: props.app.client_name,
    client_uri: props.app.client_uri ?? '',
  })

  watch(
    () => props.app,
    app => {
      values.client_name = app.client_name
      values.client_uri = app.client_uri ?? ''
    },
  )

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
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
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Section class="py-6 first:pt-0 last:pb-0">
    <Stack gap="md">
      <Heading :level="3" size="base">基本信息</Heading>

      <Form
        ref="form"
        :values="values"
        :rules="developerAppProfileSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <DeveloperConsoleAppIconField
          :src="logoSrc"
          :name="app.client_name"
          @picked="media => (logo = media)"
        />

        <FormField name="client_name" label="应用名称" required>
          <Input v-model="values.client_name" autocomplete="off" />
        </FormField>

        <FormField name="client_uri" label="主页地址">
          <Input v-model="values.client_uri" autocomplete="off" placeholder="https://" />
        </FormField>

        <Inline justify="end">
          <Button type="submit" :loading="submitting">保存</Button>
        </Inline>
      </Form>
    </Stack>
  </Section>
</template>
