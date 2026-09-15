<script setup lang="ts">
  import { Checkbox, Inline, Spinner, Tag, Text } from '@hina-ui/vue'
  import { Lock } from '@lucide/vue'
  import type { FavoriteCollectionRow } from '~/features/favorite/composables/useFavoriteCollections'

  defineOptions({ name: 'FavoriteCollectionRow' })

  defineProps<{ row: FavoriteCollectionRow; saving?: boolean }>()
  const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="px-2 py-2">
    <Checkbox
      :model-value="row.contains"
      :disabled="saving"
      block
      class="min-w-0 flex-1"
      @update:model-value="emit('toggle')"
    >
      <Inline as="span" gap="xs" align="center" :wrap="false" class="min-w-0">
        <Text as="span" size="sm" weight="medium" truncate class="min-w-0">{{ row.name }}</Text>
        <Tag v-if="row.is_default" size="sm" tone="neutral" class="shrink-0">默认</Tag>
        <Lock v-if="row.is_private" class="size-3.5 shrink-0 text-muted" />
      </Inline>
    </Checkbox>

    <Spinner v-if="saving" size="sm" class="shrink-0" />
    <Text v-else as="span" size="xs" tone="muted" class="shrink-0">{{ row.item_count }} 项</Text>
  </Inline>
</template>
