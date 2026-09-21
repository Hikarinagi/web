<script setup lang="ts">
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'
  import type { LightNovelBrowseState } from '~/features/light-novel/explore'
  import { BookOpen } from '@lucide/vue'
  import { overlayText, subText, titleOf } from '~/features/light-novel/explore'
  import { topVotedMedia } from '~/utils/media/image'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/light-novel/useBrowseFilter'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

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
  provide(BROWSE_FILTER_RECALL_KEY, filter)

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
  <BrowsePageShell
    title="轻小说图鉴"
    description="浏览 Hikarinagi 数据库中的所有轻小说条目"
    list-id="light-novel-browse-list"
    :items="data.list.items"
    :meta="data.list.meta"
    :icon="BookOpen"
    empty-title="没有符合条件的轻小说"
    :pending="pending"
    @clear="clearFilters"
  >
    <template #filters>
      <LightNovelBrowseToolbar
        :state="state"
        :total="data.list.meta.total_items"
        :disabled="pending"
        @update="emit('update', $event)"
      />
    </template>

    <template #card="{ item }">
      <BrowseWorkCard
        :to="`/light-novels/${item.id}`"
        :title="titleOf(item)"
        :sub="subText(item)"
        :cover="topVotedMedia(item.covers)"
        :overlay="overlayText(item)"
      />
    </template>
  </BrowsePageShell>
</template>
