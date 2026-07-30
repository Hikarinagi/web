<script setup lang="ts">
  import { useRevisionHistoryPage } from '~/features/revision/composables/useRevisionHistoryPage'

  definePageMeta({ container: 'full' })

  const { data, page, pending } = await useRevisionHistoryPage('producer')

  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => {
      const resource = data.value?.resource
      if (!resource) return '修订历史'
      return [resource.title, '修订历史']
    },
    type: 'profile',
  })
</script>

<template>
  <RevisionHistoryPage
    v-if="data?.resource"
    v-model:page="page"
    :page-data="data"
    :loading="pending"
  />
</template>
