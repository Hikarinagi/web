<script setup lang="ts">
  import { Button, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { FolderKanban, Plus } from '@lucide/vue'
  import type { WorkbenchHomePageData } from '~~/server/api/pages/create/projects.get'

  definePageMeta({ title: '我的投稿' })

  const route = useRoute()
  const page = ref(1)
  const kind = ref<'novel' | 'manga' | 'epub'>(
    route.query.kind === 'manga' || route.query.kind === 'epub' ? route.query.kind : 'novel',
  )
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/projects?page=${page.value}&kind=${kind.value}`,
  )
  const { data, pending } = await useHikariApiData<WorkbenchHomePageData>(requestUrl, {
    fatal: true,
  })

  watch(kind, value => {
    page.value = 1
    void navigateTo({ query: { ...route.query, kind: value } }, { replace: true })
  })

  const EMPTY = '你还没有提交任何内容。'
</script>

<template>
  <Stack v-if="data" gap="none">
    <WorkbenchProjectTable
      v-if="kind === 'novel'"
      v-model:page="page"
      purpose="mine"
      title="我的投稿"
      :icon="FolderKanban"
      :list="data.projects"
      :loading="pending"
      :empty-text="EMPTY"
    >
      <template #filter><CreatorSubmissionToolbar v-model="kind" /></template>
      <template #actions>
        <Button :as="NuxtLink" to="/create/submit" size="sm">
          <template #icon><Plus /></template>
          新投稿
        </Button>
      </template>
    </WorkbenchProjectTable>
    <WorkbenchMangaProjectTable
      v-else-if="kind === 'manga'"
      v-model:page="page"
      purpose="mine"
      title="我的投稿"
      :icon="FolderKanban"
      :list="data.mangaProjects"
      :loading="pending"
      :empty-text="EMPTY"
    >
      <template #filter><CreatorSubmissionToolbar v-model="kind" /></template>
      <template #actions>
        <Button :as="NuxtLink" to="/create/submit" size="sm">
          <template #icon><Plus /></template>
          新投稿
        </Button>
      </template>
    </WorkbenchMangaProjectTable>
    <CreatorSubmissionEpubTable
      v-else
      v-model:page="page"
      title="我的投稿"
      :icon="FolderKanban"
      :list="data.epubs"
      :loading="pending"
      :empty-text="EMPTY"
    >
      <template #filter><CreatorSubmissionToolbar v-model="kind" /></template>
      <template #actions>
        <Button :as="NuxtLink" to="/create/submit" size="sm">
          <template #icon><Plus /></template>
          新投稿
        </Button>
      </template>
    </CreatorSubmissionEpubTable>
  </Stack>
</template>
