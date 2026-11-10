<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import type { MangasBrowsePageData } from '~~/server/api/pages/mangas/browse.get'
  import {
    MANGA_SORT_OPTIONS,
    MANGA_STATUS_OPTIONS,
    sortValue,
    type MangaBrowseState,
  } from '~/features/manga/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/manga/useBrowseFilter'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'
  import { tagIdsOf } from '~/features/browse/tag-groups'
  import { rangeText, yearRanges } from '~/features/browse/years'
  import { topVotedMedia } from '~/utils/media/image'

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
    () => props.data.genres,
  )
  const { chips, more } = filter
  watch(
    () => props.data.selected_filter_labels,
    labels => {
      filter.remember('tag', labels.tags)
      if (labels.magazine) filter.remember('magazine', [labels.magazine])
    },
    { immediate: true },
  )
  provide(BROWSE_FILTER_KEY, filter)
  provide(BROWSE_FILTER_RECALL_KEY, filter)

  const tagsOpen = ref(false)
  const yearOpen = ref(false)
  const statusOpen = ref(false)
  const tagCount = computed(
    () => tagIdsOf(props.state.tag_groups).length + (props.state.tag ? 1 : 0),
  )
  const spans = computed(() => yearRanges(props.state.years))
  const yearLabel = computed(() => {
    const [only, ...rest] = spans.value
    return only && !rest.length ? rangeText(only) : '开始年份'
  })
  const status = computed({
    get: () => (props.state.serial_status ? [props.state.serial_status] : []),
    set: values =>
      emit('update', { serial_status: values[0] as MangaBrowseState['serial_status'] }),
  })

  function sort(value: string) {
    const option = MANGA_SORT_OPTIONS.find(item => item.value === value)
    if (option) emit('update', { sort_field: option.sort_field, sort_order: option.sort_order })
  }
</script>

<template>
  <BrowsePageShell
    title="漫画图鉴"
    kind="manga"
    :items="data.list.items"
    :meta="data.list.meta"
    :pending="pending"
    :chips="chips"
    :sorts="MANGA_SORT_OPTIONS"
    :sort="sortValue(state)"
    :more-count="more"
    ratio="2/3"
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
        v-model:open="statusOpen"
        label="连载状态"
        :count="status.length"
        :count-label="`已选 ${status.length} 项`"
      >
        <BrowseChoices v-model="status" single :options="MANGA_STATUS_OPTIONS" class="w-64" />
      </BrowseFilterPopover>
      <BrowseFilterPopover
        v-model:open="yearOpen"
        :label="yearLabel"
        :count="spans.length > 1 ? spans.length : 0"
        :count-label="`已选 ${spans.length} 段年份`"
      >
        <BrowseYearPicker
          :histogram="data.histogram.buckets"
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
      <MangaBrowseMore
        :state="state"
        :genres="data.genres"
        @update="next => emit('update', next)"
      />
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
          <Text size="sm" weight="medium">连载状态</Text>
          <BrowseChoices v-model="status" single :options="MANGA_STATUS_OPTIONS" />
        </Stack>
        <Stack gap="sm">
          <Text size="sm" weight="medium">开始年份</Text>
          <BrowseYearPicker
            instant
            :histogram="data.histogram.buckets"
            :years="state.years"
            @apply="years => emit('update', { years })"
          />
        </Stack>
        <MangaBrowseMore
          :state="state"
          :genres="data.genres"
          @update="next => emit('update', next)"
        />
      </Stack>
    </template>

    <template #row="{ item }">
      <MangaBrowseRow :item="item" />
    </template>
    <template #tile="{ item }">
      <BrowseTile
        :to="`/mangas/${item.id}`"
        :title="item.name_cn || item.name"
        :translated="!!item.name_cn"
        :sub="item.author?.name"
        :cover="topVotedMedia(item.covers)"
        ratio="2/3"
      />
    </template>
  </BrowsePageShell>
</template>
