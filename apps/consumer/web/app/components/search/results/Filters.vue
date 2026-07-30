<script setup lang="ts">
  import { SEARCH_TYPES, SEARCH_TYPE_LABELS, type SearchType } from '~/features/search/search'
  import type { SearchResultsState } from '~/features/search/results'

  const props = defineProps<{ state: SearchResultsState }>()
  const emit = defineEmits<{ update: [value: Partial<SearchResultsState>] }>()

  const current = computed<SearchType | ''>(() => props.state.types[0] ?? '')

  function select(type: SearchType | '') {
    emit('update', { types: type ? [type] : [], page: 1 })
  }
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button
      label="全部"
      size="small"
      rounded
      :severity="current === '' ? undefined : 'secondary'"
      :outlined="current !== ''"
      @click="select('')"
    />
    <Button
      v-for="type in SEARCH_TYPES"
      :key="type"
      :label="SEARCH_TYPE_LABELS[type]"
      size="small"
      rounded
      :severity="current === type ? undefined : 'secondary'"
      :outlined="current !== type"
      @click="select(type)"
    />
  </div>
</template>
