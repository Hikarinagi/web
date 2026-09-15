<script setup lang="ts">
  import {
    Card,
    IconButton,
    Inline,
    Input,
    InputGroup,
    SegmentedControl,
    Select,
    Text,
  } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import type { MangaBrowseState } from '~/features/manga/explore'
  import {
    MANGA_AUDIENCE_OPTIONS,
    MANGA_DECADE_OPTIONS,
    MANGA_REGION_OPTIONS,
    MANGA_SORT_OPTIONS,
    MANGA_STATUS_OPTIONS,
    sortValue,
  } from '~/features/manga/explore'

  defineOptions({ name: 'MangaBrowseToolbar' })
  const props = defineProps<{ state: MangaBrowseState; total: number; disabled?: boolean }>()
  const emit = defineEmits<{ update: [value: Partial<MangaBrowseState>] }>()

  function loadMagazines(search?: string) {
    return hikariRequest('/api/v3/mangas/magazines', { query: { search } })
  }

  const search = ref(props.state.search ?? '')
  const sort = ref(sortValue(props.state))
  watch(
    () => props.state,
    state => {
      search.value = state.search ?? ''
      sort.value = sortValue(state)
    },
  )

  const ALL = 'all'
  const regionOptions = [{ label: '全部', value: ALL }, ...MANGA_REGION_OPTIONS]
  const audienceOptions = [{ label: '全部', value: ALL }, ...MANGA_AUDIENCE_OPTIONS]
  const statusOptions = [{ label: '全部', value: ALL }, ...MANGA_STATUS_OPTIONS]
  const decadeOptions = [{ label: '全部年代', value: ALL }, ...MANGA_DECADE_OPTIONS]

  function patch(next: Partial<MangaBrowseState>) {
    emit('update', next)
  }
  function submitSearch() {
    patch({ search: search.value.trim() || undefined })
  }
  function changeSort() {
    const option = MANGA_SORT_OPTIONS.find(item => item.value === sort.value)
    if (option) patch({ sort_field: option.sort_field, sort_order: option.sort_order })
  }
</script>

<template>
  <Card :padded="false" class="flex flex-col gap-3 rounded-xl px-5 py-4 shadow-none">
    <Inline gap="md" :wrap="false">
      <InputGroup :disabled="disabled" class="min-w-0 flex-1">
        <Input
          v-model="search"
          placeholder="作品名 / 别名"
          class="min-w-0"
          @keyup.enter="submitSearch"
        />
        <IconButton label="搜索" :disabled="disabled" @click="submitSearch">
          <Search />
        </IconButton>
      </InputGroup>

      <Select
        v-model="sort"
        :options="MANGA_SORT_OPTIONS"
        :disabled="disabled"
        class="w-44 shrink-0"
        @update:model-value="changeSort"
      />
      <Text size="xs" tone="muted" class="shrink-0 whitespace-nowrap">
        共 {{ total.toLocaleString() }} 部
      </Text>
    </Inline>

    <Inline gap="none" class="gap-x-3 gap-y-2.5">
      <SegmentedControl
        :model-value="state.region ?? ALL"
        :options="regionOptions"
        :disabled="disabled"
        aria-label="地区"
        @update:model-value="
          value =>
            patch({ region: value === ALL ? undefined : (value as MangaBrowseState['region']) })
        "
      />
      <SegmentedControl
        :model-value="state.audience ?? ALL"
        :options="audienceOptions"
        :disabled="disabled"
        aria-label="受众"
        @update:model-value="
          value =>
            patch({ audience: value === ALL ? undefined : (value as MangaBrowseState['audience']) })
        "
      />
      <SegmentedControl
        :model-value="state.serial_status ?? ALL"
        :options="statusOptions"
        :disabled="disabled"
        aria-label="连载状态"
        @update:model-value="
          value =>
            patch({
              serial_status:
                value === ALL ? undefined : (value as MangaBrowseState['serial_status']),
            })
        "
      />
      <Select
        :model-value="state.decade ?? ALL"
        :options="decadeOptions"
        :disabled="disabled"
        class="w-32"
        aria-label="年代"
        @update:model-value="
          value =>
            patch({ decade: value === ALL ? undefined : (value as MangaBrowseState['decade']) })
        "
      />
      <BrowseEntityPickerPopover
        kind="magazine"
        noun="杂志"
        :load="loadMagazines"
        :model-value="state.magazine_id"
        :disabled="disabled"
        @update:model-value="value => patch({ magazine_id: value })"
      />
      <BrowseTagFilterPopover :groups="state.tag_groups" :disabled="disabled" @update="patch" />
    </Inline>
  </Card>
</template>
