<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'

  defineOptions({ name: 'WikiDiffText' })

  defineProps<{ before: string; after: string }>()
</script>

<template>
  <Inline gap="xs" align="baseline">
    <Text v-if="before" as="span" size="sm" class="rounded-sm bg-danger-soft px-1.5 line-through">
      {{ before }}
    </Text>
    <Text v-if="before && after" as="span" size="sm" tone="muted">→</Text>
    <Text v-if="after" as="span" size="sm" class="rounded-sm bg-success-soft px-1.5">
      {{ after }}
    </Text>
  </Inline>
</template>
