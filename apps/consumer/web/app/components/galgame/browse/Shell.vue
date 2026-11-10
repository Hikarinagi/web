<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'
  import {
    GALGAME_SORT_OPTIONS,
    sortValue,
    type GalgameBrowseState,
  } from '~/features/galgame/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/galgame/useBrowseFilter'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'
  import { tagIdsOf } from '~/features/browse/tag-groups'
  import { rangeText, yearRanges } from '~/features/browse/years'
  import { topVotedMedia } from '~/utils/media/image'

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
  const { chips, more } = filter
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

  const tagsOpen = ref(false)
  const yearOpen = ref(false)
  const tagCount = computed(() => tagIdsOf(props.state.tag_groups).length)
  const spans = computed(() => yearRanges(props.state.years))
  const yearLabel = computed(() => {
    const [only, ...rest] = spans.value
    return only && !rest.length ? rangeText(only) : '发售年份'
  })
  const histogram = computed(() => props.data.histogram.buckets)
  const makerOf = (item: GalgamesBrowsePageData['list']['items'][number]) =>
    item.producers.find(row => !row.role || row.role === 'DEVELOPER')?.producer.name

  function sort(value: string) {
    const option = GALGAME_SORT_OPTIONS.find(item => item.value === value)
    if (option) emit('update', { sort_field: option.sort_field, sort_order: option.sort_order })
  }
</script>

<template>
  <BrowsePageShell
    title="Galgame 图鉴"
    kind="galgame"
    :items="data.list.items"
    :meta="data.list.meta"
    :pending="pending"
    :chips="chips"
    :sorts="GALGAME_SORT_OPTIONS"
    :sort="sortValue(state)"
    :more-count="more"
    ratio="3/4"
    @sort="sort"
    @clear="filter.clear()"
    @clear-more="filter.clearMore()"
  >
    <template #filters>
      <BrowseFilterPopover
        v-model:open="tagsOpen"
        label="标签"
        :count="tagCount"
        :count-label="`已选 ${tagCount} 个标签`"
      >
        <BrowseTagPicker
          class="w-80"
          :groups="state.tag_groups"
          @update="tag_groups => emit('update', { tag_groups })"
        />
      </BrowseFilterPopover>
      <BrowseFilterPopover
        v-model:open="yearOpen"
        :label="yearLabel"
        :count="spans.length > 1 ? spans.length : 0"
        :count-label="`已选 ${spans.length} 段年份`"
      >
        <BrowseYearPicker
          :histogram="histogram"
          :years="state.years"
          @apply="
            years => {
              emit('update', { years })
              yearOpen = false
            }
          "
        />
      </BrowseFilterPopover>
    </template>

    <template #more>
      <GalgameBrowseMore :state="state" @update="next => emit('update', next)" />
    </template>

    <template #sheet>
      <Stack gap="lg">
        <Stack gap="sm">
          <Text size="sm" weight="medium">标签</Text>
          <BrowseTagPicker
            :limit="8"
            :groups="state.tag_groups"
            @update="tag_groups => emit('update', { tag_groups })"
          />
        </Stack>
        <Stack gap="sm">
          <Text size="sm" weight="medium">发售年份</Text>
          <BrowseYearPicker
            instant
            :histogram="histogram"
            :years="state.years"
            @apply="years => emit('update', { years })"
          />
        </Stack>
        <GalgameBrowseMore :state="state" @update="next => emit('update', next)" />
      </Stack>
    </template>

    <template #row="{ item }">
      <GalgameBrowseRow :item="item" />
    </template>
    <template #tile="{ item }">
      <BrowseTile
        :to="`/galgames/${item.id}`"
        :title="item.trans_title || item.origin_title"
        :translated="!!item.trans_title"
        :sub="makerOf(item)"
        :cover="topVotedMedia(item.covers)"
        ratio="3/4"
      />
    </template>
  </BrowsePageShell>
</template>
