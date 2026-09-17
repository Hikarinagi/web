<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import type { RefDisplayValue } from '../helpers'

  const props = defineProps<{
    values: RefDisplayValue[]
    variant?: 'add' | 'remove' | 'plain'
  }>()

  const tone = computed(() => {
    if (props.variant === 'add') return 'bg-success-soft text-success-text'
    if (props.variant === 'remove') return 'bg-danger-soft text-danger-text line-through'
    return 'bg-subtle text-fg'
  })
</script>

<template>
  <Inline gap="xs">
    <Inline
      v-for="value in values"
      :key="value.id"
      as="span"
      gap="xs"
      align="center"
      :wrap="false"
      class="rounded-full py-0.5 pr-2 pl-0.5"
      :class="tone"
    >
      <HikariImage
        :src="value.cover ?? ''"
        alt=""
        preset="small"
        class="size-5 shrink-0 rounded-full bg-inset"
        image-class="size-full object-cover object-top"
      >
        <template #empty />
        <template #error />
      </HikariImage>
      <Text as="span" size="xs" class="text-inherit">{{ value.name || `#${value.id}` }}</Text>
    </Inline>
  </Inline>
</template>
