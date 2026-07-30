<script setup lang="ts">
  import type { CreatorContributionPageData } from '~~/server/api/pages/create/contributions/[id].get'

  definePageMeta({ title: '变更请求详情' })

  const route = useRoute()
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/contributions/${route.params.id}`,
  )
  const { data, refresh } = await useHikariApiData<CreatorContributionPageData>(requestUrl, {
    fatal: true,
  })

  const { subtitle } = useCreatorTopbar()
  watchEffect(() => {
    subtitle.value = `${data.value?.change_request.resource?.title ?? null} (#${data.value?.change_request.id})`
  })
  onBeforeUnmount(() => {
    subtitle.value = null
  })
</script>

<template>
  <CreatorContributionDetail
    v-if="data"
    :change-request="data.change_request"
    :batch-members="data.batch_members"
    @reviewed="refresh"
    @closed="refresh"
  />
</template>
