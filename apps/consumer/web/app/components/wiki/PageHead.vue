<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'WikiPageHead' })

  defineProps<{ eyebrow?: string; title: string; lang?: string }>()
</script>

<template>
  <Inline gap="md" align="start" justify="between" class="max-md:flex-col">
    <Stack gap="sm" class="min-w-0 flex-1">
      <Text v-if="eyebrow" as="span" size="sm" weight="medium" tone="accent">{{ eyebrow }}</Text>
      <Heading :level="2" size="2xl" :lang="lang">{{ title }}</Heading>
    </Stack>
    <Inline v-if="$slots.actions" gap="sm" class="shrink-0">
      <slot name="actions" />
    </Inline>
  </Inline>
</template>
