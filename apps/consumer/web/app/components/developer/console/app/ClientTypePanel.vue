<script setup lang="ts">
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

  const confirm = useConfirm()
  const busy = ref(false)
  const current = computed(() => appFormValue(props.app.client_type, props.app.application_type))
  const selected = ref(current.value)
  const confidential = computed(() => props.app.client_type === 'confidential')

  watch(current, value => {
    selected.value = value
  })

  function confirmSwitch(next: string) {
    if (busy.value || next === current.value) return
    const shape = appFormOf(next)
    const losesSecret = confidential.value && shape.client_type === 'public'
    const gainsSecret = !confidential.value && shape.client_type === 'confidential'
    let accepted = false

    confirm.require({
      group: 'app-shell',
      header: `切换为${shape.label}`,
      message: [
        losesSecret ? '当前密钥将被立即清除，正在使用该密钥的服务将中断。' : '',
        gainsSecret ? '将签发新密钥，且仅展示一次。' : '',
        `${shape.redirect}；已配置的回调地址若不符合新规则，本次切换会失败。`,
      ]
        .filter(Boolean)
        .join('\n'),
      acceptProps: { label: '切换', severity: losesSecret ? 'danger' : 'primary' },
      rejectProps: { label: '取消', severity: 'secondary' },
      accept: () => {
        accepted = true
        void save({ client_type: shape.client_type, application_type: shape.application_type })
      },
      onHide: () => {
        if (!accepted) selected.value = current.value
      },
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
      selected.value = current.value
    }
  }
</script>

<template>
  <section class="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
    <h3 class="text-sm font-semibold text-color">应用形态</h3>

    <div class="grid gap-2 sm:grid-cols-3">
      <label
        v-for="option in DEVELOPER_APP_FORMS"
        :key="option.value"
        class="flex cursor-pointer items-start gap-2.5 rounded-lg border border-surface p-3 transition-colors hover:bg-emphasis"
        :class="selected === option.value ? 'border-hikari-primary-500' : ''"
      >
        <RadioButton
          v-model="selected"
          :value="option.value"
          :disabled="busy"
          :aria-label="option.label"
          @update:model-value="confirmSwitch(option.value)"
        />
        <span class="flex min-w-0 flex-col gap-1">
          <span class="text-sm font-medium text-color">{{ option.label }}</span>
          <span class="text-xs leading-relaxed text-muted-color">{{ option.hint }}</span>
        </span>
      </label>
    </div>

    <div v-if="confidential" class="flex flex-col gap-2">
      <p class="text-xs text-muted-color">令牌端点认证方式</p>
      <Select
        :model-value="app.token_endpoint_auth_method"
        :options="DEVELOPER_AUTH_METHODS"
        option-label="label"
        option-value="value"
        :disabled="busy"
        aria-label="令牌端点认证方式"
        class="sm:w-80"
        @update:model-value="(value: string) => save({ token_endpoint_auth_method: value })"
      >
        <template #option="{ option }">
          <span class="flex flex-col gap-0.5">
            <span class="font-mono text-sm">{{ option.label }}</span>
            <span class="text-xs text-muted-color">{{ option.hint }}</span>
          </span>
        </template>
      </Select>
      <p class="text-xs leading-relaxed text-muted-color">
        换取令牌时必须使用此处登记的方式，登记之外的方式会被拒绝。
      </p>
    </div>
  </section>
</template>
