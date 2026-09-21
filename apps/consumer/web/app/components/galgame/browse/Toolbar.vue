<script setup lang="ts">
  import {
    Checkbox,
    Divider,
    IconButton,
    Inline,
    Input,
    InputGroup,
    MultiSelect,
    Select,
    Text,
  } from '@hina-ui/vue'
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
  <Inline gap="none" class="gap-2.5">
    <Select
      v-model="sort"
      :options="GALGAME_SORT_OPTIONS"
      :disabled="disabled"
      class="w-40"
      @update:model-value="changeSort"
    />

    <Divider orientation="vertical" class="h-5 self-center" />

    <GalgameBrowsePlatformPopover
      :model-value="state.platforms"
      @update:model-value="value => patch({ platforms: value })"
    />
    <MultiSelect
      :model-value="state.origin_lang"
      :options="LANGUAGE_OPTIONS"
      placeholder="语言"
      class="w-32"
      @update:model-value="value => patch({ origin_lang: value.map(String) })"
    />

    <Divider orientation="vertical" class="h-5 self-center" />

    <BrowseEntityMultiPopover
      target="producer"
      kind="producer"
      label="厂商"
      :producer-types="['COMPANY', 'DOUJIN']"
      :model-value="state.producer_ids"
      @update:model-value="value => patch({ producer_ids: value })"
    />
    <BrowseTagFilterPopover :groups="state.tag_groups" :disabled="disabled" @update="patch" />
    <BrowseEntityMultiPopover
      target="person"
      kind="staff"
      label="staff"
      :model-value="state.staff_person_ids"
      @update:model-value="value => patch({ staff_person_ids: value })"
    />

    <Inline gap="md" class="max-w-full shrink-0">
      <InputGroup :disabled="disabled" class="w-48 shrink-0">
        <Input
          v-model="search"
          placeholder="作品名 / 别名 / ID"
          class="min-w-0"
          @keyup.enter="submitSearch"
        />
        <IconButton label="搜索" :disabled="disabled" @click="submitSearch">
          <Search />
        </IconButton>
      </InputGroup>

      <Checkbox
        :model-value="state.include_dev"
        size="sm"
        class="shrink-0"
        @update:model-value="value => patch({ include_dev: value === true })"
      >
        含开发中/中止
      </Checkbox>

      <Text size="xs" tone="muted" class="shrink-0 whitespace-nowrap">
        共 {{ total.toLocaleString() }} 部
      </Text>
    </Inline>
  </Inline>
</template>
