<script setup lang="ts">
  import { Search } from '@lucide/vue'
  import type { GalgameBrowseState } from '~/features/galgame/explore'
  import { GALGAME_SORT_OPTIONS, sortValue } from '~/features/galgame/explore'
  import { LANGUAGE_OPTIONS } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameBrowseToolbar' })
  const props = defineProps<{ state: GalgameBrowseState; total: number; disabled?: boolean }>()
  const emit = defineEmits<{ update: [value: Partial<GalgameBrowseState>] }>()

  const search = ref(props.state.search ?? '')
  const sort = ref(sortValue(props.state))
  watch(
    () => props.state,
    state => {
      search.value = state.search ?? ''
      sort.value = sortValue(state)
    },
  )

  function patch(next: Partial<GalgameBrowseState>) {
    emit('update', next)
  }
  function submitSearch() {
    patch({ search: search.value.trim() || undefined })
  }
  function changeSort() {
    const option = GALGAME_SORT_OPTIONS.find(item => item.value === sort.value)
    if (option) patch({ sort_field: option.sort_field, sort_order: option.sort_order })
  }
</script>

<template>
  <div class="flex flex-wrap items-center gap-2.5">
    <Select
      v-model="sort"
      :options="GALGAME_SORT_OPTIONS"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      size="small"
      class="w-40"
      @change="changeSort"
    />

    <span class="h-5 w-px bg-surface-200 dark:bg-surface-700" />

    <GalgameBrowsePlatformPopover
      :model-value="state.platforms"
      @update:model-value="value => patch({ platforms: value })"
    />
    <MultiSelect
      :model-value="state.origin_lang"
      :options="LANGUAGE_OPTIONS"
      option-label="label"
      option-value="value"
      placeholder="语言"
      size="small"
      :max-selected-labels="0"
      :selected-items-label="'语言 ({0})'"
      class="w-32"
      @update:model-value="value => patch({ origin_lang: value })"
    />

    <span class="h-5 w-px bg-surface-200 dark:bg-surface-700" />

    <GalgameBrowseEntitySearchPopover
      target="producer"
      kind="producer"
      label="厂商"
      :producer-types="['COMPANY', 'DOUJIN']"
      :model-value="state.producer_ids"
      @update:model-value="value => patch({ producer_ids: value })"
    />
    <GalgameBrowseTagFilterPopover
      :groups="state.tag_groups"
      :disabled="disabled"
      @update="patch"
    />
    <GalgameBrowseEntitySearchPopover
      target="person"
      kind="staff"
      label="staff"
      :model-value="state.staff_person_ids"
      @update:model-value="value => patch({ staff_person_ids: value })"
    />

    <div class="flex max-w-full shrink-0 flex-wrap items-center gap-3">
      <InputGroup class="w-48 shrink-0">
        <InputText
          v-model="search"
          size="small"
          placeholder="作品名 / 别名 / ID"
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
      <label
        class="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400"
      >
        <Checkbox
          :model-value="state.include_dev"
          binary
          input-id="browse-include-dev"
          @update:model-value="value => patch({ include_dev: value })"
        />
        含开发中/中止
      </label>
      <span class="shrink-0 text-xs whitespace-nowrap text-surface-500 dark:text-surface-400">
        共 {{ total.toLocaleString() }} 部
      </span>
    </div>
  </div>
</template>
