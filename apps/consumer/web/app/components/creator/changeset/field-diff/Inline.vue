<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'
  import { fmt } from './helpers'

  defineProps<{
    op: Record<string, unknown>
  }>()
</script>

<template>
  <Inline gap="sm" align="center">
    <Text as="span" class="rounded bg-danger-soft px-2 py-1 text-danger-text line-through">
      {{ fmt(op.from) }}
    </Text>
    <ArrowRight class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
    <Text as="span" class="rounded bg-success-soft px-2 py-1 text-success-text">
      {{ fmt(op.to) }}
    </Text>
  </Inline>
</template>
