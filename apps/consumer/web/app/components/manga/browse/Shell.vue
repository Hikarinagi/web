<script setup lang="ts">
  import type { MangasBrowsePageData } from '~~/server/api/pages/mangas/browse.get'
  import type { MangaBrowseState } from '~/features/manga/explore'
  import { BookImage } from '@lucide/vue'
  import { overlayText, subText, titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/manga/useBrowseFilter'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

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
  provide(BROWSE_FILTER_RECALL_KEY, filter)

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
  <BrowsePageShell
    title="漫画图鉴"
    description="浏览 Hikarinagi 数据库中的所有漫画条目"
    list-id="manga-browse-list"
    :items="data.list.items"
    :meta="data.list.meta"
    :icon="BookImage"
    empty-title="没有符合条件的漫画"
    :pending="pending"
    @clear="clearFilters"
  >
    <template #filters>
      <MangaBrowseToolbar
        :state="state"
        :total="data.list.meta.total_items"
        :disabled="pending"
        @update="emit('update', $event)"
      />
    </template>

    <template #card="{ item }">
      <BrowseWorkCard
        :to="`/mangas/${item.id}`"
        :title="titleOf(item)"
        :sub="subText(item)"
        :cover="topVotedMedia(item.covers)"
        :overlay="overlayText(item)"
      />
    </template>
  </BrowsePageShell>
</template>
