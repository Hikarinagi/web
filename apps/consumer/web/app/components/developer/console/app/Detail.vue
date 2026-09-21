<script setup lang="ts">
  import { Button, Heading, Inline, Panel, Stack, Tag } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
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
  <Stack gap="lg">
    <Stack gap="sm" align="start">
      <Button
        :as="NuxtLink"
        to="/developers/console"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="-mx-2"
      >
        <template #icon><ArrowLeft /></template>
        返回控制台
      </Button>
      <Inline gap="sm" align="center">
        <DeveloperConsoleAppIcon :src="app.logo" :name="app.client_name" />
        <Inline gap="sm" align="center" wrap>
          <Heading :level="2" size="xl">{{ app.client_name }}</Heading>
          <Tag v-if="!app.enabled">已停用</Tag>
        </Inline>
      </Inline>
    </Stack>

    <Panel title="应用设置">
      <Stack gap="none" class="divide-y divide-line">
        <DeveloperConsoleAppCredentialsPanel :app :oauth @rotated="onRotated" />
        <DeveloperConsoleAppProfilePanel :app @changed="emit('changed')" />
        <DeveloperConsoleAppClientTypePanel :app @changed="emit('changed')" @rotated="onRotated" />
        <DeveloperConsoleAppScopesPanel :app @changed="emit('changed')" />
        <DeveloperConsoleAppRedirectPanel :app @changed="emit('changed')" />
      </Stack>
    </Panel>

    <DeveloperConsoleAppDangerPanel :app @changed="emit('changed')" />

    <DeveloperConsoleSecretDialog v-model:visible="secretOpen" :secret />
  </Stack>
</template>
