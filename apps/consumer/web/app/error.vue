<script setup lang="ts">
  import type { NuxtError } from '#app'
  import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
  import { isRecord } from '#shared/utils/record'
  import HikariProvider from './provider.vue'

  const props = defineProps<{
    error: NuxtError
  }>()

  const statusCode = computed(() => props.error.status ?? 500)
  const isMaintenance = computed(
    () => isRecord(props.error.data) && props.error.data.code === HIKARI_BIZ_CODE.SITE_MAINTENANCE,
  )
  const title = computed(() => {
    if (isMaintenance.value) return '正在停机维护'
    return statusCode.value === 404 ? '什么都没有...' : '页面加载失败'
  })

  useHikariSeoMeta({
    title: () => title.value,
    noindex: true,
  })
</script>

<template>
  <HikariProvider />
  <ErrorMaintenance v-if="isMaintenance" :error="error" />
  <ErrorPage v-else :error="error" />
</template>
