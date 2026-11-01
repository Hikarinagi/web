<script setup lang="ts">
  import type { CreatorTodosPageData } from '~~/server/api/pages/create/todos.get'

  definePageMeta({ title: '待完善' })

  const page = ref(1)
  const kind = ref('all')
  const section = ref('all')
  const type = ref('all')
  watch([kind, section, type], () => {
    page.value = 1
  })
  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const query = new URLSearchParams({ page: String(page.value) })
    if (kind.value !== 'all') query.set('kind', kind.value)
    if (section.value !== 'all') query.set('section', section.value)
    if (type.value !== 'all') query.set('type', type.value)
    return `/api/pages/create/todos?${query.toString()}`
  })
  const { data, pending, refresh } = await useHikariApiData<CreatorTodosPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorTodosTable
    v-if="data"
    v-model:page="page"
    v-model:kind="kind"
    v-model:section="section"
    v-model:type="type"
    :page-data="data"
    :loading="pending"
    @changed="refresh()"
  />
</template>
