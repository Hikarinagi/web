<script setup lang="ts">
  import type { RulesPageData } from '~~/server/api/pages/create/wiki/rules.get'

  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
    title: '编辑规范',
    key: () => '/create/wiki/rules',
    fill: true,
  })

  const route = useRoute()
  const clause = computed(() =>
    typeof route.params.clause === 'string' && route.params.clause ? route.params.clause : null,
  )
  const { data, error, status, refresh } = useHikariApiData<RulesPageData>(
    '/api/pages/create/wiki/rules',
    { key: 'wiki-rules' },
  )
  useCreatorPage({
    title: '编辑规范',
    crumbs: () => [
      { label: '编辑规范', to: '/create/wiki/rules' },
      ...(clause.value ? [{ label: clause.value }] : []),
    ],
    loading: () => status.value === 'pending',
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiRulesBook v-else-if="data" :book="data" :clause="clause" />
</template>
