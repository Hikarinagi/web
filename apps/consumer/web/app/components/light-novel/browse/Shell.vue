<script setup lang="ts">
  import { Stack, Switch, Text } from '@hina-ui/vue'
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'
  import {
    LIGHT_NOVEL_SORT_OPTIONS,
    sortValue,
    type LightNovelBrowseState,
  } from '~/features/light-novel/explore'
  import { BROWSE_FILTER_KEY, useBrowseFilter } from '~/features/light-novel/useBrowseFilter'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'
  import { tagIdsOf } from '~/features/browse/tag-groups'
  import { rangeText, yearRanges } from '~/features/browse/years'
  import { topVotedMedia } from '~/utils/media/image'

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
  const { chips, more } = filter
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

  const tagsOpen = ref(false)
  const yearOpen = ref(false)
  const tagCount = computed(() => tagIdsOf(props.state.tag_groups).length)
  const spans = computed(() => yearRanges(props.state.years))
  const yearLabel = computed(() => {
    const [only, ...rest] = spans.value
    return only && !rest.length ? rangeText(only) : '开始年份'
  })

  function sort(value: string) {
    const option = LIGHT_NOVEL_SORT_OPTIONS.find(item => item.value === value)
    if (option) emit('update', { sort_field: option.sort_field, sort_order: option.sort_order })
  }
</script>

<template>
  <BrowsePageShell
    title="轻小说图鉴"
    kind="light-novel"
    :items="data.list.items"
    :meta="data.list.meta"
    :pending="pending"
    :chips="chips"
    :sorts="LIGHT_NOVEL_SORT_OPTIONS"
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
      <Switch
        :model-value="state.readable"
        class="shrink-0"
        @update:model-value="readable => emit('update', { readable })"
      >
        可在站内阅读
      </Switch>
    </template>

    <template #more>
      <LightNovelBrowseMore :state="state" @update="next => emit('update', next)" />
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
          <Text size="sm" weight="medium">开始年份</Text>
          <BrowseYearPicker
            instant
            :histogram="data.histogram.buckets"
            :years="state.years"
            @apply="years => emit('update', { years })"
          />
        </Stack>
        <Switch
          :model-value="state.readable"
          @update:model-value="readable => emit('update', { readable })"
        >
          可在站内阅读
        </Switch>
        <LightNovelBrowseMore :state="state" @update="next => emit('update', next)" />
      </Stack>
    </template>

    <template #row="{ item }">
      <LightNovelBrowseRow :item="item" />
    </template>
    <template #tile="{ item }">
      <BrowseTile
        :to="`/light-novels/${item.id}`"
        :title="item.name_cn || item.name"
        :translated="!!item.name_cn"
        :sub="item.author?.name"
        :cover="topVotedMedia(item.covers)"
        ratio="2/3"
      />
    </template>
  </BrowsePageShell>
</template>
