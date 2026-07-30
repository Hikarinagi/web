<script setup lang="ts">
  import type { RateDimensionChip } from '~/features/rate/dimensions'

  defineOptions({ name: 'RateDimensionChips' })
  defineProps<{ dimensions: RateDimensionChip[] }>()
</script>

<template>
  <div v-if="dimensions.length" class="flex flex-wrap items-center gap-1.5">
    <span v-for="d in dimensions" :key="d.label" class="rounded px-1.5 py-0.5 text-xs bg-emphasis">
      <span class="text-muted-color">{{ d.label }}</span>
      <span class="ml-1 font-semibold text-color">{{ d.score }}</span>
    </span>
  </div>
</template>
