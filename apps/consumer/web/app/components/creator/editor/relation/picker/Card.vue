<script setup lang="ts">
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'

  const props = defineProps<{
    item: BackendEntitySummary
    selected: boolean
    target: EntityTarget
  }>()

  const imageClass = computed(() =>
    cn('size-full', props.target === 'producer' ? 'object-contain' : 'object-cover object-top'),
  )
</script>

<template>
  <Button
    unstyled
    :class="[
      'relative flex flex-col gap-1.5 rounded-lg border p-2 text-left transition-colors',
      selected
        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 dark:bg-primary-950 dark:ring-primary-800'
        : 'border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600',
    ]"
  >
    <HikariImage
      :src="item.cover ?? ''"
      alt=""
      preset="small"
      class="aspect-square w-full rounded bg-surface-100 dark:bg-surface-800"
      :image-class="imageClass"
    >
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>
    <span class="truncate text-sm font-medium">{{ item.name }}</span>
    <span class="font-mono text-xs text-muted-color">#{{ item.id }}</span>
    <Badge
      v-if="selected"
      value="已选"
      class="absolute top-0 left-0 rounded-tr-none! rounded-bl-none! text-sm"
    />
    <Badge
      v-if="item.status === 'PENDING'"
      value="未核实"
      severity="warn"
      class="absolute top-0 right-0 rounded-tl-none! rounded-br-none! text-xs"
    />
  </Button>
</template>
