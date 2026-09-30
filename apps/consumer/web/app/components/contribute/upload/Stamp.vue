<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { IntakeStatus } from '~/features/contribute/intake-status'
  import { useDeskSize } from '~/features/contribute/useDeskSize'

  defineProps<{ ink: IntakeStatus['ink']; label: string }>()
  const { caption } = useDeskSize()
</script>

<template>
  <Text
    as="span"
    :size="caption"
    weight="semibold"
    :class="
      cn(
        'shrink-0 -rotate-3 rounded-xs border border-current px-1.5 py-0.5 tracking-wider whitespace-nowrap',
        {
          'text-danger-text': ink === 'red',
          'text-info-text': ink === 'blue',
          'text-fg': ink === 'ink',
        },
      )
    "
  >
    {{ label }}
  </Text>
</template>
