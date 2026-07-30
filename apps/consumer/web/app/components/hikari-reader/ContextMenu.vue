<script setup lang="ts">
  import { motion } from 'motion-v'
  import type { Component } from 'vue'

  export interface ReaderMenuItem {
    key: string
    label: string
    icon?: Component
    shortcut?: string
    disabled?: boolean
    danger?: boolean
    command: () => void
  }

  defineProps<{
    items: readonly (ReaderMenuItem | 'separator')[]
  }>()

  const emit = defineEmits<{ dismiss: [] }>()

  function invoke(item: ReaderMenuItem) {
    if (item.disabled) return
    item.command()
    emit('dismiss')
  }
</script>

<template>
  <motion.ul
    class="reader-context-menu flex min-w-56 flex-col gap-0.5 rounded-xl p-1.5"
    role="menu"
    :initial="{ opacity: 0, scale: 0.96, y: -4 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.97, y: -2 }"
  >
    <template v-for="(item, index) in items" :key="index">
      <li v-if="item === 'separator'" class="reader-context-menu-separator" role="separator" />
      <li v-else role="none">
        <Button
          unstyled
          type="button"
          role="menuitem"
          :disabled="item.disabled"
          class="reader-context-menu-item flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :data-danger="item.danger ? 'true' : undefined"
          @click="invoke(item)"
        >
          <component
            :is="item.icon"
            v-if="item.icon"
            :size="15"
            aria-hidden="true"
            class="shrink-0 opacity-80"
          />
          <span class="flex-1 text-left">{{ item.label }}</span>
          <span v-if="item.shortcut" class="reader-context-menu-shortcut text-xs opacity-55">
            {{ item.shortcut }}
          </span>
        </Button>
      </li>
    </template>
  </motion.ul>
</template>

<style scoped>
  .reader-context-menu {
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    color: var(--reader-text);
    box-shadow: var(--reader-bar-shadow);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-context-menu-item {
    color: var(--reader-text);
    transition:
      background-color 140ms ease,
      color 140ms ease;
  }

  .reader-context-menu-item:not(:disabled):hover,
  .reader-context-menu-item:not(:disabled):focus-visible {
    background: var(--reader-icon-hover-bg);
    outline: none;
  }

  .reader-context-menu-item[data-danger='true'] {
    color: var(--p-red-500, #ef4444);
  }

  .reader-context-menu-separator {
    height: 1px;
    margin: 4px 2px;
    background: var(--reader-bar-border);
  }
</style>
