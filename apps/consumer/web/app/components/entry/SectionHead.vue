<script setup lang="ts">
  import { Heading, Inline, Text } from '@hina-ui/vue'

  defineOptions({ name: 'EntrySectionHead' })
  defineProps<{ id?: string; title: string; count?: number }>()
</script>

<template>
  <Inline
    :id="id"
    align="center"
    justify="between"
    gap="md"
    :wrap="false"
    class="scroll-mt-(--sticky-top)"
  >
    <Inline gap="sm" align="baseline" :wrap="false">
      <Heading :level="2" size="xl">{{ title }}</Heading>
      <Text v-if="count !== undefined" tone="muted" class="tabular-nums">{{ count }}</Text>
    </Inline>
    <slot name="actions" />
  </Inline>
</template>
