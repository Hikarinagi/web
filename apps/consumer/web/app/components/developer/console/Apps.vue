<script setup lang="ts">
  import { Button, Empty, Panel, Stack } from '@hina-ui/vue'
  import { Boxes, Plus } from '@lucide/vue'
  import type { DevelopersConsolePageData } from '~~/server/api/pages/developers/console.get'

  defineOptions({ name: 'DeveloperConsoleApps' })

  const props = defineProps<{
    apps: DevelopersConsolePageData['apps']
    limit: DevelopersConsolePageData['limit']
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const atLimit = computed(() => props.apps.length >= props.limit)
  const limitHint = computed(() => {
    if (!atLimit.value) return undefined
    if (props.limit === 0) return '当前未开放自助创建应用'
    return `已达应用数量上限 ${props.limit} 个，删除已有应用后可继续创建`
  })

  const createOpen = ref(false)
  const secret = ref<{ client_id: string; client_secret: string } | null>(null)
  const secretOpen = ref(false)

  function onCreated(created: { client_id: string; client_secret: string | null }) {
    createOpen.value = false
    if (created.client_secret) {
      secret.value = { client_id: created.client_id, client_secret: created.client_secret }
      secretOpen.value = true
    }
    emit('changed')
  }
</script>

<template>
  <Stack gap="lg">
    <Panel title="我的应用" :count="props.apps.length" :description="limitHint">
      <template #actions>
        <Button :disabled="atLimit" @click="createOpen = true">
          <template #icon><Plus /></template>
          创建应用
        </Button>
      </template>

      <Empty v-if="!props.apps.length" title="还没有应用">
        <template #icon><Boxes /></template>
      </Empty>
      <Stack v-else gap="none" class="divide-y divide-line">
        <DeveloperConsoleAppItem v-for="app in props.apps" :key="app.client_id" :app />
      </Stack>
    </Panel>

    <DeveloperConsoleCreateDialog v-model:visible="createOpen" @created="onCreated" />
    <DeveloperConsoleSecretDialog v-model:visible="secretOpen" :secret />
  </Stack>
</template>
