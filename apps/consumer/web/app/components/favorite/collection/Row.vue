<script setup lang="ts">
  import { Loader2, Lock } from '@lucide/vue'
  import type { FavoriteCollectionRow } from '~/features/favorite/composables/useFavoriteCollections'

  defineOptions({ name: 'FavoriteCollectionRow' })

  const props = defineProps<{ row: FavoriteCollectionRow; saving?: boolean }>()
  const emit = defineEmits<{ toggle: [] }>()

  const inputId = computed(() => `fav-col-${props.row.id}`)
</script>

<template>
  <label
    :for="inputId"
    class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
  >
    <Checkbox
      :input-id="inputId"
      :model-value="row.contains"
      binary
      :disabled="saving"
      @update:model-value="emit('toggle')"
    />
    <span class="flex min-w-0 flex-1 items-center gap-1.5">
      <span class="truncate text-sm font-medium text-color">{{ row.name }}</span>
      <span
        v-if="row.is_default"
        class="shrink-0 rounded bg-surface-100 px-1.5 py-0.5 text-[11px] text-muted-color dark:bg-surface-800"
      >
        默认
      </span>
      <Lock v-if="row.is_private" class="size-3.5 shrink-0 text-muted-color" />
    </span>
    <Loader2 v-if="saving" class="size-4 shrink-0 animate-spin text-hikari-primary-500" />
    <span v-else class="shrink-0 text-[13px] text-muted-color">{{ row.item_count }} 项</span>
  </label>
</template>
