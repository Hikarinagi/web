<script setup lang="ts">
  import type { CreatorNoticesPageData } from '~~/server/api/pages/create/notices.get'

  definePageMeta({ title: '公示中的编辑' })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/notices?page=${page.value}`,
  )
  const { data, pending, refresh } = await useHikariApiData<CreatorNoticesPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorChangesTable
    v-if="data"
    v-model:page="page"
    title="公示中的编辑"
    empty-text="暂无正在公示的编辑"
    :list="data.notices"
    :loading="pending"
    actions
  >
    <template #row-actions="{ row }">
      <CreatorNoticesActions :row="row" class="py-3" @changed="refresh()" />
    </template>
  </CreatorChangesTable>
</template>
