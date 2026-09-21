<script setup lang="ts">
  import { Inline, SearchInput, SegmentedControl, Stack } from '@hina-ui/vue'
  import { Library } from '@lucide/vue'
  import {
    BOOKSHELF_STATUS_FILTERS,
    SPACE_BOOKSHELF_PAGE_SIZE,
    type BookshelfStatusFilterKey,
    type SpaceMangaReadingStats,
    type SpaceMangaShelfPage,
  } from '~/features/space/space'
  import { usePagedList } from '~/features/space/usePagedList'

  defineOptions({ name: 'SpaceTabsBookshelfMangaShelf' })

  const props = defineProps<{
    bookshelf: { list: SpaceMangaShelfPage; stats: SpaceMangaReadingStats }
  }>()

  const filter = ref<BookshelfStatusFilterKey>('all')
  const search = ref('')

  const { list, pending, loadPage } = usePagedList(props.bookshelf.list, page =>
    hikariRequest('/api/v3/reader/me/manga/reading', {
      query: {
        page,
        page_size: SPACE_BOOKSHELF_PAGE_SIZE,
        ...(filter.value === 'all' ? {} : { status: filter.value }),
        ...(search.value.trim() ? { search: search.value.trim() } : {}),
      },
    }),
  )

  const statCells = computed(() => [
    { value: String(props.bookshelf.stats.reading_count), unit: '部', label: '在读' },
    { value: String(props.bookshelf.stats.chapters_read), unit: '话', label: '读过' },
    { value: String(props.bookshelf.stats.finished_count), unit: '部', label: '读完' },
  ])

  const hasQuery = computed(() => filter.value !== 'all' || search.value.trim().length > 0)

  const FILTER_OPTIONS = BOOKSHELF_STATUS_FILTERS.map(f => ({ value: f.key, label: f.label }))

  function selectFilter(value: string | number | undefined) {
    const next = BOOKSHELF_STATUS_FILTERS.find(f => f.key === value)?.key
    if (next) filter.value = next
  }

  watch(filter, () => loadPage(1))
  const debouncedSearch = useDebounceFn(() => loadPage(1), 300)
  watch(search, () => debouncedSearch())
</script>

<template>
  <Stack gap="lg">
    <SpaceTabsBookshelfStatsRow :cells="statCells" />

    <Inline gap="sm" justify="between" class="sm:flex-nowrap">
      <SegmentedControl
        :model-value="filter"
        :options="FILTER_OPTIONS"
        size="sm"
        aria-label="阅读状态"
        @update:model-value="selectFilter"
      />
      <SearchInput
        v-model="search"
        placeholder="搜索标题"
        size="sm"
        class="w-full sm:w-56"
        aria-label="搜索标题"
      />
    </Inline>

    <Stack v-if="list.items.length" gap="none" class="relative">
      <SpaceTabsBookshelfMangaCard v-for="item in list.items" :key="item.manga_id" :item="item" />
      <LoadingOverlay :visible="pending" />
    </Stack>
    <SpaceEmptyState
      v-else
      :icon="Library"
      :text="hasQuery ? '没有匹配的漫画' : '书架空空如也'"
      :description="hasQuery ? undefined : '在站内读过的漫画会自动在此记录'"
    />

    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </Stack>
</template>
