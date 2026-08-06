<script setup lang="ts">
  import type { MangasBrowsePageData } from '~~/server/api/pages/mangas/browse.get'
  import type { MangaBrowseState } from '~/features/manga/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/manga/useBrowseFilter'

  defineOptions({ name: 'MangaBrowseShell' })
  const props = defineProps<{
    data: MangasBrowsePageData
    pending?: boolean
    state: MangaBrowseState
  }>()
  const emit = defineEmits<{ update: [value: Partial<MangaBrowseState>] }>()

  const filter = useBrowseFilter(
    () => props.state,
    next => emit('update', next),
  )
  watch(
    () => props.data.selected_filter_labels,
    labels => {
      filter.remember('tag', labels.tags)
      if (labels.magazine) filter.remember('magazine', [labels.magazine])
      filter.rememberGenres(labels.genres)
    },
    { immediate: true },
  )
  provide(BROWSE_FILTER_KEY, filter)

  function clearFilters() {
    emit('update', {
      search: undefined,
      region: undefined,
      audience: undefined,
      serial_status: undefined,
      decade: undefined,
      magazine_id: undefined,
      tag: undefined,
      tag_groups: [],
      genre: [],
    })
  }
</script>

<template>
  <div class="mx-auto flex max-w-app flex-col gap-5 px-6 py-10">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-surface-950 dark:text-white">漫画图鉴</h1>
      <p class="text-sm text-surface-600 dark:text-surface-400">
        浏览 Hikarinagi 数据库中的所有漫画条目
      </p>
    </div>

    <MangaBrowseToolbar
      :state="state"
      :total="data.list.meta.total_items"
      :disabled="pending"
      @update="emit('update', $event)"
    />

    <MangaBrowseChipsBar />

    <div id="manga-browse-list" data-list-wrapper class="flex flex-col gap-5">
      <MangaBrowseGrid :list="data.list" :pending="pending" @clear="clearFilters" />

      <Paginator
        :meta="data.list.meta"
        :loading="pending"
        route="push"
        align="center"
        scroll-target="#manga-browse-list"
      />
    </div>
  </div>
</template>
