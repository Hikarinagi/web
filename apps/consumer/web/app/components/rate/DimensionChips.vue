<script setup lang="ts">
  import type { RateDimensionChip } from '~/features/rate/dimensions'

  defineOptions({ name: 'RateDimensionChips' })
  defineProps<{ dimensions: RateDimensionChip[] }>()
</script>

<template>
  <div v-if="dimensions.length" class="flex flex-wrap items-center gap-1.5">
    <Tag v-for="d in dimensions" :key="d.label" class="px-2! py-0.5! text-xs! font-medium!">
      <span class="text-muted-color">{{ d.label }}</span>
      <span class="ml-1 font-semibold text-color">{{ d.score }}</span>
    </Tag>
  </div>
</template>
