<script setup lang="ts">
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'HikariColumns' })

  const props = withDefaults(defineProps<{ count?: 2 | 3; class?: string }>(), { count: 2 })

  const rootClass = computed(() =>
    cn('gap-4', props.count === 3 ? 'md:columns-2 xl:columns-3' : 'md:columns-2', props.class),
  )
</script>

<template>
  <div :class="rootClass"><slot /></div>
</template>
