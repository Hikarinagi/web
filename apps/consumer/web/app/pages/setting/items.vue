<script setup lang="ts">
  defineOptions({ name: 'PageSpaceSettingItems' })
  definePageMeta({ title: '我的道具' })

  const { data, refresh } = await useHikariApiData('/api/pages/setting/items', { fatal: true })
</script>

<template>
  <SpaceSettingItemPanel v-if="data" :data="data" :refresh="refresh" />
</template>
