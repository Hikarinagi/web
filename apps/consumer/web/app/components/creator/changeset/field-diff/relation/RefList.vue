<script setup lang="ts">
  import type { RefDisplayValue } from '../helpers'

  defineProps<{
    values: RefDisplayValue[]
    variant?: 'add' | 'remove' | 'plain'
  }>()
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <span
      v-for="value in values"
      :key="value.id"
      class="inline-flex items-center gap-1.5 rounded-full py-0.5 pr-2 pl-0.5"
      :class="{
        'bg-green-500/10 text-green-700 dark:text-green-300': variant === 'add',
        'bg-red-500/10 text-red-700 line-through dark:text-red-300': variant === 'remove',
        'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-200':
          !variant || variant === 'plain',
      }"
    >
      <HikariImage
        :src="value.cover ?? ''"
        alt=""
        preset="small"
        class="size-5 shrink-0 rounded-full bg-surface-200 dark:bg-surface-700"
        image-class="size-full object-cover object-top"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <span class="text-xs">{{ value.name || `#${value.id}` }}</span>
    </span>
  </div>
</template>
