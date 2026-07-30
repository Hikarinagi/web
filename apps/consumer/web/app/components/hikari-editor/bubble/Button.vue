<script setup lang="ts">
  import type { Component } from 'vue'
  import { cn } from '~/utils/cn'

  defineProps<{
    icon: Component
    active?: boolean
  }>()

  defineEmits<{ press: [MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    :class="cn('hikari-bubble-menu__btn', active && 'is-active')"
    @mousedown.prevent="e => $emit('press', e)"
  >
    <component :is="icon" :size="16" />
  </button>
</template>

<style scoped>
  .hikari-bubble-menu__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    color: var(--editor-text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      background 60ms ease-out,
      color 60ms ease-out;
  }
  .hikari-bubble-menu__btn:hover:not(.is-active) {
    background: var(--editor-toolbar-item-hover);
    color: var(--editor-text-color);
  }
  .hikari-bubble-menu__btn.is-active {
    background: var(--editor-toolbar-item-active-bg);
    color: var(--editor-toolbar-item-active);
  }
</style>
