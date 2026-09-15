<script setup lang="ts">
  import { Card, Ripple, Tag, Text } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'BrowseFilterTrigger' })

  withDefaults(
    defineProps<{
      label: string
      active?: boolean
      count?: number
      disabled?: boolean
    }>(),
    { active: false, count: 0, disabled: false },
  )
</script>

<template>
  <Card
    as="button"
    :padded="false"
    :disabled="disabled"
    :class="
      cn(
        'hn-state-layer inline-flex h-9 min-w-24 hn-interactive items-center gap-1.5 px-3 shadow-none',
        'disabled:pointer-events-none disabled:opacity-60',
        active ? 'border-accent bg-accent-soft text-accent-text' : 'text-fg',
      )
    "
  >
    <Ripple />
    <Search class="size-3.5 shrink-0" />
    <Text as="span" size="sm" weight="medium" truncate class="min-w-0">{{ label }}</Text>
    <Tag v-if="count > 0" size="sm" tone="accent">{{ count }}</Tag>
  </Card>
</template>
