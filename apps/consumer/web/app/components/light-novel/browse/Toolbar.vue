<script setup lang="ts">
  import {
    Card,
    Checkbox,
    IconButton,
    Inline,
    Input,
    InputGroup,
    SegmentedControl,
    Select,
    Text,
  } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import type { LightNovelBrowseState } from '~/features/light-novel/explore'
  import {
    LIGHT_NOVEL_DECADE_OPTIONS,
    LIGHT_NOVEL_SORT_OPTIONS,
    LIGHT_NOVEL_STATUS_OPTIONS,
    sortValue,
  } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelBrowseToolbar' })
  const props = defineProps<{ state: LightNovelBrowseState; total: number; disabled?: boolean }>()
  const emit = defineEmits<{ update: [value: Partial<LightNovelBrowseState>] }>()

  function loadBunko(search?: string) {
    return hikariRequest('/api/v3/light-novels/bunko', { query: { search } })
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
  const statusOptions = [{ label: '全部', value: ALL }, ...LIGHT_NOVEL_STATUS_OPTIONS]
  const decadeOptions = [{ label: '全部年代', value: ALL }, ...LIGHT_NOVEL_DECADE_OPTIONS]

  function patch(next: Partial<LightNovelBrowseState>) {
    emit('update', next)
  }
  function submitSearch() {
    patch({ search: search.value.trim() || undefined })
  }
  function changeSort() {
    const option = LIGHT_NOVEL_SORT_OPTIONS.find(item => item.value === sort.value)
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
        :options="LIGHT_NOVEL_SORT_OPTIONS"
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
        :model-value="state.novel_status ?? ALL"
        :options="statusOptions"
        :disabled="disabled"
        aria-label="连载状态"
        @update:model-value="
          value =>
            patch({
              novel_status:
                value === ALL ? undefined : (value as LightNovelBrowseState['novel_status']),
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
            patch({
              decade: value === ALL ? undefined : (value as LightNovelBrowseState['decade']),
            })
        "
      />
      <BrowseEntityPickerPopover
        kind="bunko"
        noun="文库"
        :load="loadBunko"
        :model-value="state.bunko_id"
        :disabled="disabled"
        @update:model-value="value => patch({ bunko_id: value })"
      />
      <BrowseTagFilterPopover :groups="state.tag_groups" :disabled="disabled" @update="patch" />
      <Checkbox
        :model-value="state.readable"
        size="sm"
        class="shrink-0"
        @update:model-value="value => patch({ readable: value === true })"
      >
        仅站内可读
      </Checkbox>
    </Inline>
  </Card>
</template>
