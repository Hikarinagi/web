<script setup lang="ts">
  import { FormField, Heading, RadioGroup, Section, Select, Stack, Text } from '@hina-ui/vue'
  import type { SelectOption } from '@hina-ui/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import {
    appFormOf,
    appFormValue,
    DEVELOPER_APP_FORMS,
    DEVELOPER_AUTH_METHODS,
  } from '~/features/developer/appForms'

  defineOptions({ name: 'DeveloperConsoleAppClientTypePanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{
    changed: []
    rotated: [secret: { client_id: string; client_secret: string }]
  }>()

  const { confirm } = useHikariConfirm()
  const busy = ref(false)
  const current = computed(() => appFormValue(props.app.client_type, props.app.application_type))
  const confidential = computed(() => props.app.client_type === 'confidential')

  const formOptions = DEVELOPER_APP_FORMS.map(option => ({
    value: option.value,
    label: option.label,
    description: option.hint,
  }))

  const authMethodOptions = computed<SelectOption<{ hint: string }>[]>(() =>
    DEVELOPER_AUTH_METHODS.map(method => ({
      value: method.value,
      label: method.label,
      hint: method.hint,
    })),
  )

  function confirmSwitch(next: string | number | null | undefined) {
    const value = String(next ?? '')
    if (busy.value || !value || value === current.value) return
    const shape = appFormOf(value)
    const losesSecret = confidential.value && shape.client_type === 'public'
    const gainsSecret = !confidential.value && shape.client_type === 'confidential'

    confirm({
      title: `切换为${shape.label}`,
      description: [
        losesSecret ? '当前密钥将被立即清除，正在使用该密钥的服务将中断。' : '',
        gainsSecret ? '将签发新密钥，且仅展示一次。' : '',
        `${shape.redirect}；已配置的回调地址若不符合新规则，本次切换会失败。`,
      ]
        .filter(Boolean)
        .join('\n'),
      confirmText: '切换',
      tone: losesSecret ? 'danger' : 'accent',
      onConfirm: () =>
        save({ client_type: shape.client_type, application_type: shape.application_type }),
    })
  }

  async function save(body: Record<string, string>) {
    busy.value = true
    try {
      const result = await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'patch'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        { method: 'patch', path: { client_id: props.app.client_id }, body },
      )
      if (result.client_secret) {
        emit('rotated', { client_id: result.client_id, client_secret: result.client_secret })
      }
      emit('changed')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Section class="py-6 first:pt-0 last:pb-0">
    <Stack gap="md">
      <Heading :level="3" size="base">应用形态</Heading>

      <RadioGroup
        :model-value="current"
        :options="formOptions"
        :disabled="busy"
        orientation="horizontal"
        block
        aria-label="应用形态"
        @update:model-value="confirmSwitch"
      />

      <FormField
        v-if="confidential"
        label="令牌端点认证方式"
        description="换取令牌时必须使用此处登记的方式，登记之外的方式会被拒绝。"
      >
        <Select
          :model-value="app.token_endpoint_auth_method"
          :options="authMethodOptions"
          :disabled="busy"
          class="sm:w-80"
          @update:model-value="value => save({ token_endpoint_auth_method: String(value) })"
        >
          <template #option="{ option }">
            <Stack as="span" gap="none">
              <Text as="span" size="sm" class="font-mono">{{ option.label }}</Text>
              <Text as="span" size="xs" tone="muted">{{ option.hint }}</Text>
            </Stack>
          </template>
        </Select>
      </FormField>
    </Stack>
  </Section>
</template>
