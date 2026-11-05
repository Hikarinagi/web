<script setup lang="ts">
  import { SimpleGrid, Stack } from '@hina-ui/vue'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
    title: '概览',
  })

  const { data, error, status, refresh } = useHikariApiData<CreatorOverviewPageData>(
    '/api/pages/create/overview',
  )
  useCreatorPage({ loading: () => status.value === 'pending' })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <Stack v-else-if="data" gap="lg">
    <CreatorOverviewQueues :counts="data.review_counts" />
    <CreatorProjectSection :novels="data.novels" :mangas="data.mangas" />
    <SimpleGrid min="24rem" gap="lg">
      <CreatorOverviewChanges title="我的编辑" :list="data.edits" empty-text="暂无编辑" />
      <CreatorOverviewChanges
        title="关注的条目"
        :list="data.watched"
        empty-text="你关注的条目暂无更改"
        editor
      />
    </SimpleGrid>
  </Stack>
</template>
