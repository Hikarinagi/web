<script setup lang="ts">
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
        :options="LIGHT_NOVEL_SORT_OPTIONS"
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
        :model-value="state.novel_status ?? ALL"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        :disabled="disabled"
        size="small"
        aria-label="连载状态"
        @change="event => patch({ novel_status: event.value === ALL ? undefined : event.value })"
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
      <LightNovelBrowseBunkoPopover
        :model-value="state.bunko_id"
        :disabled="disabled"
        @update:model-value="value => patch({ bunko_id: value })"
      />
      <LightNovelBrowseTagFilterPopover
        :groups="state.tag_groups"
        :disabled="disabled"
        @update="patch"
      />
      <label
        class="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400"
      >
        <Checkbox
          :model-value="state.readable"
          binary
          input-id="ln-browse-readable"
          @update:model-value="value => patch({ readable: value })"
        />
        仅站内可读
      </label>
    </div>
  </div>
</template>
