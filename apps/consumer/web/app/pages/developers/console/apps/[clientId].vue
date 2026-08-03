<script setup lang="ts">
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'

  defineOptions({ name: 'DeveloperAppPage' })
  const route = useRoute()
  const { data, refresh } = await useHikariApiData<DeveloperAppPageData>(
    `/api/pages/developers/console/apps/${String(route.params.clientId)}`,
    { fatal: true },
  )

  useHikariSeoMeta({ title: () => data.value?.app.client_name ?? '应用详情' })
</script>

<template>
  <DeveloperConsoleAppDetail v-if="data" :app="data.app" :oauth="data.oauth" @changed="refresh" />
</template>
