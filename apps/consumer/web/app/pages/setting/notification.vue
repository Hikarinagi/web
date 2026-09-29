<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'

  defineOptions({ name: 'PageSpaceSettingNotification' })
  definePageMeta({ title: '消息提醒' })

  const { data } = await useHikariApiData('/api/pages/setting/notification', { fatal: true })
</script>

<template>
  <Stack v-if="data" gap="lg">
    <SpaceSettingUpdateNotifyPanel kind="novel" :initial="data.novel" />
    <SpaceSettingUpdateNotifyPanel kind="manga" :initial="data.manga" />
  </Stack>
</template>
