<script setup lang="ts">
  import type { PageResult } from '@hikarinagi/shared'
  import { CATALOG_SORTS, type CatalogSort } from '~/features/manga/catalog'
  import type { MangaSummary } from '~/features/manga/explore'
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
  <section class="mx-auto box-content flex max-w-app flex-col gap-5 px-6 py-10">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-baseline gap-2.5">
        <h2 class="text-[22px] font-bold text-surface-950 dark:text-white">全部作品</h2>
        <span class="text-sm text-surface-500 dark:text-surface-400">
          {{ total.toLocaleString() }} 部
        </span>
      </div>
      <div
        class="flex items-center gap-0.5 rounded-[9px] bg-surface-100 p-[3px] dark:bg-surface-800/60"
      >
        <Button
          v-for="opt in CATALOG_SORTS"
          :key="opt.value"
          unstyled
          class="inline-flex cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors"
          :class="
            sort === opt.value
              ? 'bg-surface-0 text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white'
              : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
          "
          @click="changeSort(opt.value)"
        >
          {{ opt.label }}
        </Button>
      </div>
    </div>

    <LoadingOverlay
      v-if="list.items.length"
      :loading="pending"
      content-class="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6"
    >
      <MangaBrowseCard v-for="item in list.items" :key="item.manga.id" :item="item.manga" />
    </LoadingOverlay>
    <p v-else class="py-16 text-center text-sm text-surface-500 dark:text-surface-400">
      还没有收录作品
    </p>

    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      align="center"
      @change="loadPage"
    />
  </section>
</template>
