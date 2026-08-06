<script setup lang="ts">
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'
  import type { LightNovelBrowseState } from '~/features/light-novel/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/light-novel/useBrowseFilter'

  defineOptions({ name: 'LightNovelBrowseShell' })
  const props = defineProps<{
    data: LightNovelsBrowsePageData
    pending?: boolean
    state: LightNovelBrowseState
  }>()
  const emit = defineEmits<{ update: [value: Partial<LightNovelBrowseState>] }>()

  const filter = useBrowseFilter(
    () => props.state,
    next => emit('update', next),
  )
  watch(
    () => props.data.selected_filter_labels,
    labels => {
      filter.remember('tag', labels.tags)
      if (labels.bunko) filter.remember('bunko', [labels.bunko])
    },
    { immediate: true },
  )
  provide(BROWSE_FILTER_KEY, filter)

  function clearFilters() {
    emit('update', {
      search: undefined,
      novel_status: undefined,
      readable: false,
      decade: undefined,
      bunko_id: undefined,
      tag_groups: [],
    })
  }
</script>

<template>
  <div class="mx-auto flex max-w-app flex-col gap-5 px-6 py-10">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-surface-950 dark:text-white">轻小说图鉴</h1>
      <p class="text-sm text-surface-600 dark:text-surface-400">
        浏览 Hikarinagi 数据库中的所有轻小说条目
      </p>
    </div>

    <LightNovelBrowseToolbar
      :state="state"
      :total="data.list.meta.total_items"
      :disabled="pending"
      @update="emit('update', $event)"
    />

    <LightNovelBrowseChipsBar />

    <div id="light-novel-browse-list" data-list-wrapper class="flex flex-col gap-5">
      <LightNovelBrowseGrid :list="data.list" :pending="pending" @clear="clearFilters" />

      <Paginator
        :meta="data.list.meta"
        :loading="pending"
        route="push"
        align="center"
        scroll-target="#light-novel-browse-list"
      />
    </div>
  </div>
</template>
