<script setup lang="ts">
  import { Inline, Tag, Text } from '@hina-ui/vue'
  import type { RateDimensionChip } from '~/features/rate/dimensions'

  defineOptions({ name: 'RateDimensionChips' })
  defineProps<{ dimensions: RateDimensionChip[] }>()
</script>

<template>
  <Inline v-if="dimensions.length" gap="xs" class="flex-wrap">
    <Tag v-for="d in dimensions" :key="d.label" variant="soft" tone="neutral" size="sm">
      <Text as="span" size="xs" tone="muted">{{ d.label }}</Text>
      <Text as="span" size="xs" weight="semibold">{{ d.score }}</Text>
    </Tag>
  </Inline>
</template>
