<script setup lang="ts">
  import { Maximize2, Minus, Plus } from '@lucide/vue'

  defineOptions({ name: 'MermaidDiagramToolbar' })
  const emit = defineEmits<{ zoom: [factor: number]; reset: [] }>()
</script>

<template>
  <div
    class="absolute right-3 bottom-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-lg:opacity-100"
  >
    <Button rounded severity="secondary" size="small" aria-label="放大" @click="emit('zoom', 1.2)">
      <template #icon><Plus class="size-4" /></template>
    </Button>
    <Button
      rounded
      severity="secondary"
      size="small"
      aria-label="缩小"
      @click="emit('zoom', 1 / 1.2)"
    >
      <template #icon><Minus class="size-4" /></template>
    </Button>
    <Button rounded severity="secondary" size="small" aria-label="适应画布" @click="emit('reset')">
      <template #icon><Maximize2 class="size-4" /></template>
    </Button>
  </div>
</template>
