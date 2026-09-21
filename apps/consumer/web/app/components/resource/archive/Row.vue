<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'ResourceArchiveRow' })

  withDefaults(defineProps<{ icon: Component; label?: string; align?: 'center' | 'start' }>(), {
    label: undefined,
    align: 'center',
  })
</script>

<template>
  <Inline gap="sm" :align="align" :wrap="false">
    <component
      :is="icon"
      class="size-3.5 shrink-0 text-faint"
      :class="align === 'start' ? 'mt-0.5' : undefined"
      aria-hidden="true"
    />
    <Inline gap="xs" align="baseline" class="min-w-0">
      <Text v-if="label" as="span" size="xs" tone="faint" class="shrink-0">{{ label }}</Text>
      <Text as="span" size="sm" class="min-w-0 wrap-anywhere"><slot /></Text>
    </Inline>
  </Inline>
</template>
