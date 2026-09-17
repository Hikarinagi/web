<script setup lang="ts">
  import { Empty } from '@hina-ui/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'SpaceEmptyState' })

  withDefaults(
    defineProps<{
      text: string
      description?: string
      icon?: Component
    }>(),
    {
      description: undefined,
      icon: undefined,
    },
  )
</script>

<template>
  <Empty :title="text" :description="description" :icon="false" size="sm" class="min-h-32 py-10">
    <template v-if="icon" #icon>
      <component :is="icon" class="size-6 text-muted opacity-55" />
    </template>
  </Empty>
</template>
