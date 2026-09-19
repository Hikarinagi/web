<script setup lang="ts">
  import { ScrollArea, Stack } from '@hina-ui/vue'
  import { SEARCH_LISTBOX_ID, searchOptionId } from '~/features/search/search'
  import type { useSearch } from '~/features/search/composables/useSearch'

  const props = defineProps<{ search: ReturnType<typeof useSearch> }>()
  const emit = defineEmits<{ pick: [string] }>()

  watch(
    () => props.search.activeIndex,
    index => {
      if (index < 0) return
      nextTick(() => {
        document.getElementById(searchOptionId(index))?.scrollIntoView({ block: 'nearest' })
      })
    },
  )
</script>

<template>
  <ScrollArea :id="SEARCH_LISTBOX_ID" role="listbox" class="min-h-0 min-w-0">
    <Stack gap="none" class="p-1.5">
      <SearchPanelResults
        v-if="search.mode === 'typing'"
        :search="search"
        @pick="emit('pick', $event)"
      />
      <SearchPanelIdle v-else :search="search" @pick="emit('pick', $event)" />
    </Stack>
  </ScrollArea>
</template>
