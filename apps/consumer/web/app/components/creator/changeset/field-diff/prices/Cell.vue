<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'

  const props = defineProps<{
    kind: 'kept' | 'modified' | 'added' | 'removed'
    value: string | number | null
    oldValue?: string | number | null
  }>()

  const changed = computed(() => props.kind === 'modified' && props.oldValue !== props.value)
</script>

<template>
  <div class="flex items-center gap-2">
    <template v-if="changed">
      <span
        class="rounded bg-red-500/10 px-1.5 py-0.5 text-xs text-red-700 line-through dark:text-red-300"
      >
        {{ oldValue ?? '' }}
      </span>
      <ArrowRight :size="12" class="shrink-0 text-muted-color" aria-hidden="true" />
      <span
        class="rounded bg-green-500/10 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-300"
      >
        {{ value ?? '' }}
      </span>
    </template>
    <span
      v-else
      class="text-sm"
      :class="
        kind === 'added'
          ? 'text-green-700 dark:text-green-300'
          : kind === 'removed'
            ? 'text-red-700 line-through dark:text-red-300'
            : ''
      "
    >
      {{ value ?? '' }}
    </span>
  </div>
</template>
