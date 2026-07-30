<script setup lang="ts">
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'
  import type { GalgameBrowseState } from '~/features/galgame/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/galgame/useBrowseFilter'

  defineOptions({ name: 'GalgameBrowseShell' })
  const props = defineProps<{
    data: GalgamesBrowsePageData
    pending?: boolean
    state: GalgameBrowseState
  }>()
  const emit = defineEmits<{ update: [value: Partial<GalgameBrowseState>] }>()

  const filter = useBrowseFilter(
    () => props.state,
    next => emit('update', next),
  )
  watch(
    () => props.data.selected_filter_labels,
    labels => {
      filter.remember('producer', labels.producers)
      filter.remember('tag', labels.tags)
      filter.remember('staff', labels.staff)
    },
    { immediate: true },
  )
  provide(BROWSE_FILTER_KEY, filter)
</script>

<template>
  <div class="mx-auto flex max-w-app flex-col gap-5 px-6 py-10">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-surface-950 dark:text-white">视觉小说图鉴</h1>
      <p class="text-sm text-surface-600 dark:text-surface-400">
        浏览Hikarinagi数据库中的所有视觉小说条目
      </p>
    </div>

    <GalgameBrowseTimeline
      :histogram="data.histogram"
      :release-from="state.release_from"
      :release-to="state.release_to"
      :release-periods="state.release_periods"
      @update="emit('update', $event)"
    />

    <GalgameBrowseToolbar
      :state="state"
      :total="data.list.meta.total_items"
      :disabled="pending"
      @update="emit('update', $event)"
    />

    <GalgameBrowseChipsBar />

    <div id="galgame-browse-list" data-list-wrapper class="flex flex-col gap-5">
      <GalgameBrowseGrid :list="data.list" :pending="pending" />

      <Paginator
        :meta="data.list.meta"
        :loading="pending"
        route="push"
        align="center"
        scroll-target="#galgame-browse-list"
      />
    </div>
  </div>
</template>
