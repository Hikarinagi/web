<script setup lang="ts">
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'
  import type { BrowseViewMode, GalgameBrowseState } from '~/features/galgame/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/galgame/useBrowseFilter'

  defineOptions({ name: 'GalgameBrowseShell' })
  const props = defineProps<{
    data: GalgamesBrowsePageData
    pending?: boolean
    state: GalgameBrowseState
  }>()
  const emit = defineEmits<{ update: [value: Partial<GalgameBrowseState>] }>()

  // 视图模式只存 localStorage,不进 URL;SSR 一律按 grid 渲染,挂载后再读回偏好
  const storedMode = useLocalStorage<BrowseViewMode>('hikari-galgame-browse-view-mode', 'grid')
  const mode = ref<BrowseViewMode>('grid')
  onMounted(() => {
    if (storedMode.value === 'list' || storedMode.value === 'grid') mode.value = storedMode.value
  })
  function changeMode(next: BrowseViewMode) {
    mode.value = next
    storedMode.value = next
  }

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
        浏览 Hikarinagi 数据库中的所有视觉小说条目
      </p>
    </div>

    <GalgameBrowseTimeline
      :histogram="data.histogram"
      :start-from="state.start_from"
      :start-to="state.start_to"
      :start-periods="state.start_periods"
      :end-from="state.end_from"
      :end-to="state.end_to"
      :end-periods="state.end_periods"
      @update="emit('update', $event)"
    />

    <GalgameBrowseToolbar
      :state="state"
      :total="data.list.meta.total_items"
      :disabled="pending"
      :mode="mode"
      @update="emit('update', $event)"
      @update:mode="changeMode"
    />

    <GalgameBrowseChipsBar />

    <div id="galgame-browse-list" data-list-wrapper class="flex flex-col gap-5">
      <GalgameBrowseList v-if="mode === 'list'" :list="data.list" :pending="pending" />
      <GalgameBrowseGrid v-else :list="data.list" :pending="pending" />

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
