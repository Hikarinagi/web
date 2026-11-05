<script setup lang="ts">
  import {
    CHANGE_TITLES,
    changeTitle,
    changesRoute,
    readChangesQuery,
  } from '~/features/wiki/changes'
  import { readPage } from '~/features/wiki/history'
  import type { ChangePageData } from '~~/server/api/pages/create/wiki/changes/[id].get'

  definePageMeta({
    title: '修改详情',
    key: () => '/create/wiki/changes/detail',
  })

  const route = useRoute()
  const request = computed(() => {
    const page = readPage(route.query.entry_page)
    return `/api/pages/create/wiki/changes/${String(route.params.id)}${page > 1 ? `?entry_page=${page}` : ''}` as `/api/pages/${string}`
  })
  const { data, error, status, refresh } = useHikariApiData<ChangePageData>(request)
  const state = computed(() => readChangesQuery(route.query))
  const list = computed(() => changesRoute(state.value))
  useCreatorPage({
    crumbs: () =>
      data.value
        ? [
            { label: CHANGE_TITLES[state.value.f], to: list.value },
            {
              label: changeTitle({
                entry_count: data.value.edit.entry_count,
                entries: data.value.edit.entries.map(part => ({ ...part.entry, ...part })),
              }),
            },
          ]
        : undefined,
    loading: () => status.value === 'pending',
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiChangesDetail
    v-else-if="data"
    :key="data.edit.id"
    :data="data"
    :back="list"
    :back-label="CHANGE_TITLES[state.f]"
    @changed="refresh()"
  />
</template>
