<script setup lang="ts">
  defineOptions({ name: 'PageMeDownloads' })
  definePageMeta({ title: '下载中心' })

  const { data, refresh } = await useHikariApiData('/api/pages/me/downloads', { fatal: true })
</script>

<template>
  <MeDownloadCenter v-if="data" :data="data" :refresh="refresh" />
</template>
