<script setup lang="ts">
  import { Inline, SearchInput, Select, type DataTableFilter } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameDownloadsFilters' })
  const search = defineModel<string>('search', { required: true })
  const props = defineProps<{
    placeholder: string
    selects: { key: string; label: string; options: { value: string; label: string }[] }[]
    columnFilters: DataTableFilter[]
  }>()
  defineEmits<{ filter: [key: string, value: string | number | null | undefined] }>()

  const selected = (key: string) =>
    props.columnFilters.find(filter => filter.key === key)?.value as string | undefined
</script>

<template>
  <Inline gap="sm">
    <SearchInput
      v-model="search"
      size="sm"
      :placeholder="placeholder"
      :aria-label="placeholder"
      class="w-64 max-w-full"
    />
    <Select
      v-for="select in selects"
      :key="select.key"
      :model-value="selected(select.key)"
      :options="select.options"
      :placeholder="select.label"
      :aria-label="select.label"
      clearable
      size="sm"
      class="w-40"
      @update:model-value="value => $emit('filter', select.key, value)"
    />
  </Inline>
</template>
