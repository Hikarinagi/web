<script setup lang="ts">
  import { SegmentedControl } from '@hina-ui/vue'
  import type { CreatorEditsPageData } from '~~/server/api/pages/create/edits.get'

  definePageMeta({ title: '我的编辑' })

  const VIEWS = [
    { value: 'applied', label: '已生效' },
    { value: 'reverted', label: '已被撤销' },
    { value: 'pending', label: '公示中' },
    { value: 'watchlist', label: '关注的条目' },
  ]
  const page = ref(1)
  const view = ref('applied')
  watch(view, () => {
    page.value = 1
  })
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/edits?page=${page.value}&view=${view.value}`,
  )
  const { data, pending } = await useHikariApiData<CreatorEditsPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorChangesTable
    v-if="data"
    v-model:page="page"
    title="我的编辑"
    empty-text="暂无内容"
    :list="data.edits"
    :loading="pending"
  >
    <template #filter>
      <SegmentedControl v-model="view" :options="VIEWS" size="sm" class="self-start" />
    </template>
  </CreatorChangesTable>
</template>
