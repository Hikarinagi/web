<script setup lang="ts">
  import { Button, Inline, Panel, Stack, Text, toast } from '@hina-ui/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import { AlertTriangle } from '@lucide/vue'

  defineOptions({ name: 'DeveloperConsoleAppDangerPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const { confirm } = useHikariConfirm()
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
      toast.success(props.app.enabled ? '应用已停用' : '应用已启用')
      emit('changed')
    } finally {
      busy.value = false
    }
  }

  function confirmRemove() {
    confirm({
      title: '删除应用',
      description: `删除后「${props.app.client_name}」的凭据立即失效且无法恢复`,
      confirmText: '删除',
      tone: 'danger',
      onConfirm: () => remove(),
    })
  }

  async function remove() {
    busy.value = true
    try {
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'delete'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        { method: 'delete', path: { client_id: props.app.client_id } },
      )
      toast.success('应用已删除')
      await navigateTo('/developers/console')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Panel title="危险操作">
    <template #icon><AlertTriangle /></template>
    <Stack gap="none" class="divide-y divide-line">
      <Inline gap="md" align="center" justify="between" class="py-3">
        <Text as="span" size="sm" weight="medium">
          {{ app.enabled ? '停用应用' : '启用应用' }}
        </Text>
        <Button variant="outline" tone="neutral" :loading="busy" @click="toggleEnabled">
          {{ app.enabled ? '停用' : '启用' }}
        </Button>
      </Inline>
      <Inline gap="md" align="center" justify="between" class="py-3">
        <Text as="span" size="sm" weight="medium">删除应用</Text>
        <Button tone="danger" :loading="busy" @click="confirmRemove">删除</Button>
      </Inline>
    </Stack>
  </Panel>
</template>
