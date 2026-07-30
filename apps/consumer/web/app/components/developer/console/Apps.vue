<script setup lang="ts">
  import { Boxes, Plus } from '@lucide/vue'
  import type { DevelopersConsolePageData } from '~~/server/api/pages/developers/console.get'

  defineOptions({ name: 'DeveloperConsoleApps' })

  const props = defineProps<{ apps: DevelopersConsolePageData['apps'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const createOpen = ref(false)
  const secret = ref<{ client_id: string; client_secret: string } | null>(null)
  const secretOpen = ref(false)

  function onCreated(created: { client_id: string; client_secret: string }) {
    createOpen.value = false
    secret.value = created
    secretOpen.value = true
    emit('changed')
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <CardPanel title="我的应用" :count="props.apps.length">
      <template #actions>
        <Button label="创建应用" :disabled="props.apps.length >= 3" @click="createOpen = true">
          <template #icon><Plus class="size-4" /></template>
        </Button>
      </template>

      <CreatorEmpty v-if="!props.apps.length" text="还没有应用" :icon="Boxes" />
      <div v-else class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
        <DeveloperConsoleAppItem v-for="app in props.apps" :key="app.client_id" :app />
      </div>
    </CardPanel>

    <DeveloperConsoleCreateDialog v-model:visible="createOpen" @created="onCreated" />
    <DeveloperConsoleSecretDialog v-model:visible="secretOpen" :secret />
  </div>
</template>
