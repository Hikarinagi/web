<script setup lang="ts">
  defineOptions({ name: 'DevelopersConsolePage' })

  const { data, refresh } = await useHikariApiData('/api/pages/developers/console', {
    fatal: true,
  })

  useHikariSeoMeta({ title: '开发者控制台' })
</script>

<template>
  <DeveloperConsoleApps v-if="data" :apps="data.apps" @changed="refresh" />
</template>
