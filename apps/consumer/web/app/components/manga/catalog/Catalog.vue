<script setup lang="ts">
  import { Grid, Heading, Inline, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import type { PageResult } from '@hikarinagi/shared'
  import { CATALOG_SORTS, type CatalogSort } from '~/features/manga/catalog'
  import { overlayText, subText, titleOf, type MangaSummary } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'
  import { usePagedList } from '~/features/space/usePagedList'

  defineOptions({ name: 'MangaCatalog' })

  type CatalogItem = { manga: MangaSummary }
  const props = defineProps<{
    initial: PageResult<CatalogItem>
    total: number
    load: (page: number, sort: CatalogSort) => Promise<PageResult<CatalogItem>>
  }>()

  const sort = ref<CatalogSort>('recent')
  const { list, pending, loadPage } = usePagedList(props.initial, page =>
    props.load(page, sort.value),
  )

  function changeSort(value: CatalogSort) {
    if (value === sort.value) return
    sort.value = value
    void loadPage(1)
  }
</script>

<template>
  <Stack as="section" gap="none" class="px-6 py-10">
    <Stack gap="md" class="mx-auto w-full max-w-app">
      <Inline gap="sm" align="center" justify="between" wrap>
        <Inline gap="sm" align="baseline">
          <Heading :level="2" size="xl">全部作品</Heading>
          <Text as="span" size="sm" tone="muted">{{ total.toLocaleString() }} 部</Text>
        </Inline>
        <SegmentedControl
          :model-value="sort"
          :options="[...CATALOG_SORTS]"
          size="sm"
          @update:model-value="value => changeSort(value as CatalogSort)"
        />
      </Inline>

      <Grid
        v-if="list.items.length"
        :cols="2"
        gap="none"
        class="relative gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6"
      >
        <BrowseWorkCard
          v-for="item in list.items"
          :key="item.manga.id"
          :to="`/mangas/${item.manga.id}`"
          :title="titleOf(item.manga)"
          :sub="subText(item.manga)"
          :cover="topVotedMedia(item.manga.covers)"
          :overlay="overlayText(item.manga)"
        />
        <LoadingOverlay :visible="pending" />
      </Grid>
      <Text v-else as="p" size="sm" tone="muted" class="py-16 text-center">还没有收录作品</Text>

      <Paginator
        v-if="list.meta.total_items > list.meta.page_size"
        :meta="list.meta"
        :loading="pending"
        align="center"
        @change="loadPage"
      />
    </Stack>
  </Stack>
</template>
