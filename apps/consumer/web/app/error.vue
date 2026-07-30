<script setup lang="ts">
  import type { NuxtError } from '#app'
  import HikariProvider from './provider.vue'

  const props = defineProps<{
    error: NuxtError
  }>()

  const statusCode = computed(() => props.error.status ?? 500)
  const title = computed(() => (statusCode.value === 404 ? '什么都没有...' : '页面加载失败'))

  useHikariSeoMeta({
    title: () => title.value,
    noindex: true,
  })
</script>

<template>
  <HikariProvider />
  <ErrorPage :error="error" />
</template>
