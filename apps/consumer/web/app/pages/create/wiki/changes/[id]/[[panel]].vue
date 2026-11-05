<script setup lang="ts">
  import {
    CHANGE_TITLES,
    changeTitle,
    changesRoute,
    readChangesQuery,
  } from '~/features/wiki/changes'
  import type { ChangePageData } from '~~/server/api/pages/create/wiki/changes/[id].get'

  definePageMeta({
    title: '修改详情',
    key: route => `/create/wiki/changes/${String(route.params.id)}`,
  })

  const route = useRoute()
  const request = computed(
    () => `/api/pages/create/wiki/changes/${String(route.params.id)}` as `/api/pages/${string}`,
  )
  const { data, refresh } = await useHikariApiData<ChangePageData>(request, { fatal: true })
  const state = computed(() => readChangesQuery(route.query))
  const list = computed(() => changesRoute(state.value))
  useCreatorPage({
    crumbs: () =>
      data.value
        ? [
            { label: CHANGE_TITLES[state.value.f], to: list.value },
            {
              label: changeTitle({
                entries: data.value.edit.entries.map(part => ({ ...part.entry, ...part })),
              }),
            },
          ]
        : undefined,
  })
</script>

<template>
  <WikiChangesDetail
    v-if="data"
    :data="data"
    :back="list"
    :back-label="CHANGE_TITLES[state.f]"
    @changed="refresh()"
  />
</template>
