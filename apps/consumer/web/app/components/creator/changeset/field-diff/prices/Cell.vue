<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'

  const props = defineProps<{
    kind: 'kept' | 'modified' | 'added' | 'removed'
    value: string | number | null
    oldValue?: string | number | null
  }>()

  const changed = computed(() => props.kind === 'modified' && props.oldValue !== props.value)
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false">
    <template v-if="changed">
      <Text
        as="span"
        size="xs"
        class="rounded bg-danger-soft px-1.5 py-0.5 text-danger-text line-through"
      >
        {{ oldValue ?? '' }}
      </Text>
      <ArrowRight class="size-3 shrink-0 text-muted" aria-hidden="true" />
      <Text as="span" size="xs" class="rounded bg-success-soft px-1.5 py-0.5 text-success-text">
        {{ value ?? '' }}
      </Text>
    </template>
    <Text
      v-else
      as="span"
      size="sm"
      :class="
        kind === 'added'
          ? 'text-success-text'
          : kind === 'removed'
            ? 'text-danger-text line-through'
            : ''
      "
    >
      {{ value ?? '' }}
    </Text>
  </Inline>
</template>
