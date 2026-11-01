<script setup lang="ts">
  import type { CreatorChangesPageData } from '~~/server/api/pages/create/changes.get'

  definePageMeta({ title: '最近更改' })

  const page = ref(1)
  const route = useRoute()
  const filter = ref(typeof route.query.filter === 'string' ? route.query.filter : 'all')
  const section = ref('all')
  const type = ref('all')
  const task = ref<number | null>(Number(route.query.task) > 0 ? Number(route.query.task) : null)
  watch([filter, section, type, task], () => {
    page.value = 1
  })
  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const query = new URLSearchParams({ page: String(page.value) })
    if (filter.value !== 'all') query.set('filter', filter.value)
    if (section.value !== 'all') query.set('section', section.value)
    if (type.value !== 'all') query.set('type', type.value)
    if (task.value) query.set('task', String(task.value))
    return `/api/pages/create/changes?${query.toString()}`
  })
  const { data, pending, refresh } = await useHikariApiData<CreatorChangesPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorChangesTable
    v-if="data"
    v-model:page="page"
    title="最近更改"
    empty-text="没有符合筛选条件的更改"
    :list="data.changes"
    :loading="pending"
    actions
    @changed="refresh()"
  >
    <template #filter>
      <CreatorChangesFilters
        v-model:filter="filter"
        v-model:section="section"
        v-model:type="type"
        v-model:task="task"
        :types="data.types"
        :task-name="data.task?.name"
      />
    </template>
  </CreatorChangesTable>
</template>
