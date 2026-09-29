<script setup lang="ts">
  import { Page, PageBody, Stack } from '@hina-ui/vue'
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
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <ContributeScene :manga="data.manga" />
    <Page size="xl">
      <PageBody>
        <Stack gap="xl" class="lg:flex-row lg:items-start">
          <ContributeWanted :data="data" class="min-w-0 flex-1" />
          <ContributeContributors :contributors="data.contributors" class="lg:w-88 lg:shrink-0" />
        </Stack>
      </PageBody>
    </Page>
  </Stack>
</template>
