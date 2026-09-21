<script setup lang="ts">
  import { Empty } from '@hina-ui/vue'

  defineProps<{ title?: string }>()
</script>

<template>
  <Empty size="lg" :title="title ?? '创作者中心'" description="此页面正在开发中" />
</template>
