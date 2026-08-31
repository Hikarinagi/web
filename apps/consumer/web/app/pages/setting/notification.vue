<script setup lang="ts">
  defineOptions({ name: 'PageSpaceSettingNotification' })
  definePageMeta({ title: '消息提醒' })

  const { data } = await useHikariApiData('/api/pages/setting/notification', { fatal: true })
</script>

<template>
  <SpaceSettingMangaNotifyPanel v-if="data" :manga="data.manga" />
</template>
