<script setup lang="ts">
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import { AlertTriangle } from '@lucide/vue'

  defineOptions({ name: 'DeveloperConsoleAppDangerPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const confirm = useConfirm()
  const busy = ref(false)

  async function toggleEnabled() {
    busy.value = true
    try {
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'patch'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        {
          method: 'patch',
          path: { client_id: props.app.client_id },
          body: { enabled: !props.app.enabled },
        },
      )
      push.success({ message: props.app.enabled ? '应用已停用' : '应用已启用' })
      emit('changed')
    } finally {
      busy.value = false
    }
  }

  function confirmRemove() {
    confirm.require({
      group: 'app-shell',
      header: '删除应用',
      message: `删除后「${props.app.client_name}」的凭据立即失效且无法恢复`,
      acceptProps: { label: '删除', severity: 'danger' },
      rejectProps: { label: '取消', severity: 'secondary' },
      accept: () => void remove(),
    })
  }

  async function remove() {
    busy.value = true
    try {
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'delete'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        { method: 'delete', path: { client_id: props.app.client_id } },
      )
      push.success({ message: '应用已删除' })
      await navigateTo('/developers/console')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <CardPanel title="危险操作" :icon="AlertTriangle">
    <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
      <div class="flex items-center justify-between gap-4 py-3">
        <span class="text-sm font-medium text-color">
          {{ app.enabled ? '停用应用' : '启用应用' }}
        </span>
        <Button
          :label="app.enabled ? '停用' : '启用'"
          severity="warn"
          outlined
          :loading="busy"
          @click="toggleEnabled"
        />
      </div>
      <div class="flex items-center justify-between gap-4 py-3">
        <span class="text-sm font-medium text-color">删除应用</span>
        <Button label="删除" severity="danger" :loading="busy" @click="confirmRemove" />
      </div>
    </div>
  </CardPanel>
</template>
