<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'
  import { fmt } from './helpers'

  defineProps<{
    op: Record<string, unknown>
  }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="rounded bg-red-500/10 px-2 py-1 text-red-700 line-through dark:text-red-300">
      {{ fmt(op.from) }}
    </span>
    <ArrowRight :size="14" class="shrink-0 text-muted-color" aria-hidden="true" />
    <span class="rounded bg-green-500/10 px-2 py-1 text-green-700 dark:text-green-300">
      {{ fmt(op.to) }}
    </span>
  </div>
</template>
