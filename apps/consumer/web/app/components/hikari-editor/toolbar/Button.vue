<script setup lang="ts">
  import { Button } from '@hina-ui/vue'
  import { ChevronDown } from '@lucide/vue'
  import type { Component } from 'vue'

  defineProps<{
    icon: Component
    tooltip: string
    active?: boolean
    disabled?: boolean
    isDropdown?: boolean
  }>()

  defineEmits<{ press: [MouseEvent] }>()
</script>

<template>
  <Button
    v-tooltip="{ content: tooltip, side: 'bottom' }"
    :aria-label="tooltip"
    :variant="active ? 'soft' : 'ghost'"
    :tone="active ? 'accent' : 'neutral'"
    :icon-only="!isDropdown"
    :disabled="disabled"
    @click="(e: MouseEvent) => $emit('press', e)"
  >
    <template #icon><component :is="icon" /></template>
    <template v-if="isDropdown" #trailing><ChevronDown class="opacity-60" /></template>
  </Button>
</template>
