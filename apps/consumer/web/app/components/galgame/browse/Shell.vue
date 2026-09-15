<script setup lang="ts">
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'
  import type { GalgameBrowseState } from '~/features/galgame/explore'
  import { GamepadDirectional } from '@lucide/vue'
  import { producerText, titleOf } from '~/features/galgame/explore'
  import { topVotedMedia } from '~/utils/media/image'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/galgame/useBrowseFilter'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

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
  provide(BROWSE_FILTER_RECALL_KEY, filter)
</script>

<template>
  <BrowsePageShell
    title="视觉小说图鉴"
    description="浏览 Hikarinagi 数据库中的所有视觉小说条目"
    list-id="galgame-browse-list"
    :items="data.list.items"
    :meta="data.list.meta"
    :icon="GamepadDirectional"
    empty-title="没有符合条件的作品"
    :pending="pending"
    @clear="filter.clear()"
  >
    <template #filters>
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
    </template>

    <template #card="{ item }">
      <BrowseWorkCard
        :to="`/galgames/${item.id}`"
        :title="titleOf(item)"
        :sub="producerText(item)"
        :cover="topVotedMedia(item.covers)"
        ratio="3/4"
      />
    </template>
  </BrowsePageShell>
</template>
