<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import { fmt } from './helpers'

  const props = defineProps<{
    op: Record<string, unknown>
    variant: 'added' | 'removed'
  }>()

  const value = computed(() => (props.variant === 'added' ? props.op.to : props.op.from))
</script>

<template>
  <Text
    class="rounded-lg px-3 py-2 whitespace-pre-wrap"
    :class="
      variant === 'added'
        ? 'bg-success-soft text-success-text'
        : 'bg-danger-soft text-danger-text line-through'
    "
  >
    {{ fmt(value) }}
  </Text>
</template>
