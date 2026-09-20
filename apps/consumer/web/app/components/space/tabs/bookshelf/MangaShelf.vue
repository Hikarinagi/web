<script setup lang="ts">
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

  watch(filter, () => loadPage(1))
  const debouncedSearch = useDebounceFn(() => loadPage(1), 300)
  watch(search, () => debouncedSearch())
</script>

<template>
  <div class="flex flex-col gap-5">
    <SpaceTabsBookshelfStatsRow :cells="statCells" />

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-for="f in BOOKSHELF_STATUS_FILTERS"
          :key="f.key"
          unstyled
          class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            filter === f.key ? 'bg-primary/10 text-primary' : 'text-muted-color hover:text-color'
          "
          @click="filter = f.key"
        >
          {{ f.label }}
        </Button>
      </div>
      <InputText v-model="search" placeholder="搜索标题" size="small" class="w-full sm:w-56" />
    </div>

    <LoadingOverlay v-if="list.items.length" :loading="pending" content-class="flex flex-col">
      <SpaceTabsBookshelfMangaCard v-for="item in list.items" :key="item.manga_id" :item="item" />
    </LoadingOverlay>
    <SpaceEmptyState
      v-else
      :icon="Library"
      :text="hasQuery ? '没有匹配的漫画' : '书架还空着'"
      :description="hasQuery ? undefined : '在站内读过的漫画会自动记录在这里'"
    />

    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </div>
</template>
