<script setup lang="ts">
  defineOptions({ name: 'PageMeItems' })
  definePageMeta({ title: '我的道具' })

  const { data, refresh } = await useHikariApiData('/api/pages/me/items', { fatal: true })
</script>

<template>
  <MeItemPanel v-if="data" :data="data" :refresh="refresh" />
</template>
