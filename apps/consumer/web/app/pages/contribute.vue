<script setup lang="ts">
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'

  definePageMeta({
    container: 'full',
    footer: false,
    bottomBar: false,
    floatingToolbar: false,
  })

  useHikariSeoMeta({ title: '作品投稿' })

  const route = useRoute()
  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const params = new URLSearchParams()
    for (const key of ['volume', 'manga']) {
      const value = route.query[key]
      if (typeof value === 'string' && value) params.set(key, value)
    }
    const query = params.toString()
    return query ? `/api/pages/contribute?${query}` : '/api/pages/contribute'
  })
  const { data } = await useHikariApiData<ContributePageData>(requestUrl, { fatal: true })
</script>

<template>
  <ContributeScene v-if="data" :data="data" />
</template>
