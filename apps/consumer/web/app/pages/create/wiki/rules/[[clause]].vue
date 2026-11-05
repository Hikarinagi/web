<script setup lang="ts">
  import type { RulesPageData } from '~~/server/api/pages/create/wiki/rules.get'

  definePageMeta({ title: '编辑规范', key: () => '/create/wiki/rules' })

  const route = useRoute()
  const clause = computed(() =>
    typeof route.params.clause === 'string' && route.params.clause ? route.params.clause : null,
  )
  useCreatorPage({
    title: '编辑规范',
    crumbs: () => [
      { label: '编辑规范', to: '/create/wiki/rules' },
      ...(clause.value ? [{ label: clause.value }] : []),
    ],
  })

  const { data } = await useHikariApiData<RulesPageData>('/api/pages/create/wiki/rules', {
    key: 'wiki-rules',
    fatal: true,
  })
</script>

<template>
  <WikiRulesBook v-if="data" :book="data" :clause="clause" />
</template>
