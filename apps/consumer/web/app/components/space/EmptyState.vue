<script setup lang="ts">
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
  <div class="flex min-h-32 flex-col items-center justify-center gap-2.5 py-10 text-center">
    <component :is="icon" v-if="icon" :size="26" class="text-muted-color opacity-55" />
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-muted-color">{{ text }}</p>
      <p v-if="description" class="text-muted-color/80 text-xs leading-5">{{ description }}</p>
    </div>
  </div>
</template>
