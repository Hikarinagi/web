<script setup lang="ts">
  import type { NuxtError } from '#app'
  import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
  import { isRecord } from '#shared/utils/record'
  import HikariProvider from './provider.vue'

  const props = defineProps<{
    error: NuxtError
  }>()

  useLocaleRoot()
  const { t } = useLocaleText()

  const statusCode = computed(() => props.error.status ?? 500)
  const isMaintenance = computed(
    () => isRecord(props.error.data) && props.error.data.code === HIKARI_BIZ_CODE.SITE_MAINTENANCE,
  )
  const title = computed(() => {
    if (isMaintenance.value) return t('error.maintenance.pageTitle')
    return statusCode.value === 404 ? t('error.page.notFoundTitle') : t('error.page.failedTitle')
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
