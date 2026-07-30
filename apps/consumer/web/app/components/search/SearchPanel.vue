<script setup lang="ts">
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
  <div
    class="w-full overflow-hidden rounded-lg border border-surface bg-surface-0 shadow-xl dark:bg-surface-900"
  >
    <ScrollArea :id="SEARCH_LISTBOX_ID" role="listbox" class="max-h-[min(70vh,28rem)]">
      <div class="p-1.5">
        <SearchPanelResults
          v-if="search.mode === 'typing'"
          :search="search"
          @pick="emit('pick', $event)"
        />
        <SearchPanelIdle v-else :search="search" @pick="emit('pick', $event)" />
      </div>
    </ScrollArea>
  </div>
</template>
