<script setup lang="ts">
  import { ChevronDown } from '@lucide/vue'
  import type { Component } from 'vue'
  import { cn } from '~/utils/cn'

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
  <button
    v-tooltip.bottom="tooltip"
    type="button"
    :class="
      cn(
        'toolbar-btn',
        isDropdown && 'toolbar-btn--dropdown',
        active && 'is-active',
        disabled && 'is-disabled',
      )
    "
    :disabled="disabled"
    @click="e => $emit('press', e)"
  >
    <component :is="icon" :size="16" />
    <component :is="ChevronDown" v-if="isDropdown" :size="10" class="toolbar-btn-chevron" />
  </button>
</template>

<style scoped>
  .toolbar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: var(--editor-panel-radius);
    color: var(--editor-text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      background 60ms ease-out,
      color 60ms ease-out;
  }
  .toolbar-btn--dropdown {
    width: auto;
    padding: 0 6px;
  }
  .toolbar-btn-chevron {
    opacity: 0.6;
  }
  .toolbar-btn:hover:not(.is-disabled) {
    background: var(--editor-toolbar-item-hover);
    color: var(--editor-text-color);
  }
  .toolbar-btn.is-active {
    background: var(--editor-toolbar-item-active-bg);
    color: var(--editor-toolbar-item-active);
  }
  .toolbar-btn.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .toolbar-btn:focus-visible {
    outline: 2px solid var(--editor-focus-ring);
    outline-offset: 1px;
  }
</style>
