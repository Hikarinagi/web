<script setup lang="ts">
  import { fmt } from './helpers'

  const props = defineProps<{
    op: Record<string, unknown>
    variant: 'added' | 'removed'
  }>()

  const value = computed(() => (props.variant === 'added' ? props.op.to : props.op.from))
</script>

<template>
  <p
    class="rounded-lg px-3 py-2 whitespace-pre-wrap"
    :class="
      variant === 'added'
        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
        : 'bg-red-500/10 text-red-700 line-through dark:text-red-300'
    "
  >
    {{ fmt(value) }}
  </p>
</template>
