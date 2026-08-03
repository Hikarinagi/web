<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'

  defineOptions({ name: 'DeveloperConsoleAppDetail' })

  defineProps<{ app: DeveloperAppPageData['app']; oauth: DeveloperAppPageData['oauth'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const secret = ref<{ client_id: string; client_secret: string } | null>(null)
  const secretOpen = ref(false)

  function onRotated(value: { client_id: string; client_secret: string }) {
    secret.value = value
    secretOpen.value = true
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col items-start gap-2">
      <Button
        unstyled
        as="router-link"
        to="/developers/console"
        class="-mx-2 -my-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-color transition-colors hover:bg-emphasis hover:text-color"
      >
        <ArrowLeft class="size-4" />
        返回控制台
      </Button>
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-xl font-bold text-color">{{ app.client_name }}</h2>
        <Tag v-if="!app.enabled" severity="secondary" value="已停用" />
      </div>
    </div>

    <CardPanel title="应用设置">
      <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
        <DeveloperConsoleAppCredentialsPanel :app :oauth @rotated="onRotated" />
        <DeveloperConsoleAppProfilePanel :app @changed="emit('changed')" />
        <DeveloperConsoleAppClientTypePanel :app @changed="emit('changed')" @rotated="onRotated" />
        <DeveloperConsoleAppScopesPanel :app @changed="emit('changed')" />
        <DeveloperConsoleAppRedirectPanel :app @changed="emit('changed')" />
      </div>
    </CardPanel>

    <DeveloperConsoleAppDangerPanel :app @changed="emit('changed')" />

    <DeveloperConsoleSecretDialog v-model:visible="secretOpen" :secret />
  </div>
</template>
