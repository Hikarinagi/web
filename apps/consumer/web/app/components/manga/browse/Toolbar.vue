<script setup lang="ts">
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
  <div
    class="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-0 px-5 py-4 dark:border-surface-800 dark:bg-surface-900"
  >
    <div class="flex items-center gap-3">
      <InputGroup class="min-w-0 flex-1">
        <InputText
          v-model="search"
          size="small"
          placeholder="作品名 / 别名"
          class="min-w-0"
          :disabled="disabled"
          @keyup.enter="submitSearch"
        />
        <Button
          v-tooltip.top="'搜索'"
          severity="secondary"
          size="small"
          :disabled="disabled"
          aria-label="搜索"
          @click="submitSearch"
        >
          <Search class="size-4" />
        </Button>
      </InputGroup>

      <Select
        v-model="sort"
        :options="MANGA_SORT_OPTIONS"
        option-label="label"
        option-value="value"
        :disabled="disabled"
        size="small"
        class="w-44 shrink-0"
        @change="changeSort"
      />
      <span class="shrink-0 text-xs whitespace-nowrap text-surface-500 dark:text-surface-400">
        共 {{ total.toLocaleString() }} 部
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5">
      <SelectButton
        :model-value="state.region ?? ALL"
        :options="regionOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        :disabled="disabled"
        size="small"
        aria-label="地区"
        @change="event => patch({ region: event.value === ALL ? undefined : event.value })"
      />
      <SelectButton
        :model-value="state.audience ?? ALL"
        :options="audienceOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        :disabled="disabled"
        size="small"
        aria-label="受众"
        @change="event => patch({ audience: event.value === ALL ? undefined : event.value })"
      />
      <SelectButton
        :model-value="state.serial_status ?? ALL"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        :disabled="disabled"
        size="small"
        aria-label="连载状态"
        @change="event => patch({ serial_status: event.value === ALL ? undefined : event.value })"
      />
      <Select
        :model-value="state.decade ?? ALL"
        :options="decadeOptions"
        option-label="label"
        option-value="value"
        :disabled="disabled"
        size="small"
        class="w-32"
        aria-label="年代"
        @update:model-value="value => patch({ decade: value === ALL ? undefined : value })"
      />
      <MangaBrowseMagazinePopover
        :model-value="state.magazine_id"
        :disabled="disabled"
        @update:model-value="value => patch({ magazine_id: value })"
      />
      <MangaBrowseTagFilterPopover
        :groups="state.tag_groups"
        :disabled="disabled"
        @update="patch"
      />
    </div>
  </div>
</template>
