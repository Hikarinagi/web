<script setup lang="ts">
  import type { GalgameSteamData } from '~~/server/api/pages/galgames/[id]/steam.get'

  defineOptions({ name: 'GalgameAboutSteam' })
  const props = defineProps<{ galgameId: number; appIds: number[] }>()

  const { data, error, status, refresh } = useHikariApiData<GalgameSteamData>(
    () => `/api/pages/galgames/${props.galgameId}/steam`,
    { lazy: true, server: false, toast: false },
  )
  const apps = computed(() => data.value?.apps ?? [])
  const settled = computed(() => status.value === 'success' || status.value === 'error')
</script>

<template>
  <div class="flex flex-col gap-3">
    <GalgameAboutSteamCard v-for="app in apps" :key="app.app_id" :app="app" />

    <template v-if="!apps.length">
      <GalgameAboutSteamSkeleton
        v-for="index in settled ? 0 : appIds.length"
        :key="`skeleton-${index}`"
      />

      <GalgameAboutSteamFallback
        v-if="settled"
        :app-ids="appIds"
        :failed="Boolean(error)"
        @retry="refresh()"
      />
    </template>
  </div>
</template>
