<script setup lang="ts">
  import { ContextMenu, ContextMenuItem, ContextMenuSeparator, Text } from '@hina-ui/vue'
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
    disabled?: boolean
  }>()
</script>

<template>
  <ContextMenu label="阅读器菜单" :disabled="disabled" class="min-w-56">
    <slot />

    <template #content>
      <template v-for="(item, index) in items" :key="index">
        <ContextMenuSeparator v-if="item === 'separator'" />
        <ContextMenuItem
          v-else
          :disabled="item.disabled"
          :tone="item.danger ? 'danger' : undefined"
          :text-value="item.label"
          @select="item.command()"
        >
          <template v-if="item.icon" #icon><component :is="item.icon" /></template>
          {{ item.label }}
          <template v-if="item.shortcut" #trailing>
            <Text as="span" size="xs" tone="muted">{{ item.shortcut }}</Text>
          </template>
        </ContextMenuItem>
      </template>
    </template>
  </ContextMenu>
</template>
