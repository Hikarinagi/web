<script setup lang="ts">
  import type { CreatorMembershipPageData } from '~~/server/api/pages/create/membership.get'

  definePageMeta({ title: '申请加入审核组' })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/membership?page=${page.value}`,
  )
  const { data, pending, refresh } = await useHikariApiData<CreatorMembershipPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorMembershipTable
    v-model:page="page"
    :list="data?.applications"
    :candidates="data?.candidates.items ?? []"
    :loading="pending"
    @changed="refresh"
  />
</template>
