<script setup lang="ts">
  import { IconButton, Inline } from '@hina-ui/vue'
  import { Maximize2, Minus, Plus } from '@lucide/vue'

  defineOptions({ name: 'MermaidDiagramToolbar' })
  const emit = defineEmits<{ zoom: [factor: number]; reset: [] }>()
</script>

<template>
  <Inline
    gap="xs"
    :wrap="false"
    class="absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-lg:opacity-100"
  >
    <IconButton
      pill
      size="sm"
      variant="soft"
      tone="neutral"
      label="放大"
      @click="emit('zoom', 1.2)"
    >
      <Plus />
    </IconButton>
    <IconButton
      pill
      size="sm"
      variant="soft"
      tone="neutral"
      label="缩小"
      @click="emit('zoom', 1 / 1.2)"
    >
      <Minus />
    </IconButton>
    <IconButton
      pill
      size="sm"
      variant="soft"
      tone="neutral"
      label="适应画布"
      @click="emit('reset')"
    >
      <Maximize2 />
    </IconButton>
  </Inline>
</template>
