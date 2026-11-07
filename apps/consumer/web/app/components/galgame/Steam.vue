<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { GalgameSteamData } from '~~/server/api/pages/galgames/[id]/steam.get'

  defineOptions({ name: 'GalgameSteam' })
  const props = defineProps<{ galgameId: number; appIds: number[] }>()

  const { data, error, status, refresh } = useHikariApiData<GalgameSteamData>(
    () => `/api/pages/galgames/${props.galgameId}/steam`,
    { lazy: true, server: false, toast: false },
  )
  const apps = computed(() => data.value?.apps ?? [])
  const settled = computed(() => status.value === 'success' || status.value === 'error')
</script>

<template>
  <Stack gap="none" class="gap-3">
    <GalgameSteamCard v-for="app in apps" :key="app.app_id" :app="app" />

    <template v-if="!apps.length">
      <GalgameSteamSkeleton
        v-for="index in settled ? 0 : appIds.length"
        :key="`skeleton-${index}`"
      />

      <GalgameSteamFallback
        v-if="settled"
        :app-ids="appIds"
        :failed="Boolean(error)"
        @retry="refresh()"
      />
    </template>
  </Stack>
</template>
