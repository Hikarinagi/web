<script setup lang="ts">
  import { DataList, Empty } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'

  const { state } = useMangaReview()
</script>

<template>
  <DataList
    :items="state.visible.value"
    :item-key="row => row.page.id"
    layout="grid"
    grid-min="8rem"
    grid-gap="md"
    :virtualize="{ estimateSize: 240, overscan: 2 }"
    height="100%"
    label="全部页面"
    content-class="p-4"
  >
    <template #default="{ item: row }">
      <WorkbenchMangaReviewOverviewCell :row="row" />
    </template>
    <template #empty>
      <Empty size="sm" :icon="false" title="没有符合条件的页面" />
    </template>
  </DataList>
</template>
