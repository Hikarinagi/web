<script setup lang="ts">
  import { Badge, Button, DisclosureIcon, Popover } from '@hina-ui/vue'

  defineOptions({ name: 'BrowseFilterPopover' })
  withDefaults(defineProps<{ label: string; count?: number; countLabel?: string }>(), {
    count: 0,
    countLabel: undefined,
  })
  const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <Popover v-model:open="open" side="bottom" align="start">
    <Badge :content="count || null" tone="accent" :label="countLabel">
      <Button variant="outline" tone="neutral">
        {{ label }}
        <template #trailing><DisclosureIcon :open="open" /></template>
      </Button>
    </Badge>
    <template #content>
      <slot :close="() => (open = false)" />
    </template>
  </Popover>
</template>
