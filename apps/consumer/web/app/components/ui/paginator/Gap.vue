<script setup lang="ts">
  import { ChevronsLeft, ChevronsRight, Ellipsis } from '@lucide/vue'
  import PageButton from './Button.vue'

  defineProps<{
    busy?: boolean
    direction: 'previous' | 'next'
    target: number
  }>()
  const emit = defineEmits<{ page: [value: number] }>()
</script>

<template>
  <PageButton :disabled="busy" @click="emit('page', target)">
    <span class="relative inline-grid size-4 place-items-center">
      <Ellipsis
        class="size-4 transition duration-150 group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0"
      />
      <ChevronsLeft
        v-if="direction === 'previous'"
        class="absolute size-4 scale-75 opacity-0 transition duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
      />
      <ChevronsRight
        v-else
        class="absolute size-4 scale-75 opacity-0 transition duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
      />
    </span>
  </PageButton>
</template>
