<script setup lang="ts">
  import type { Component } from 'vue'

  defineOptions({ name: 'UiCardPanel' })

  defineProps<{
    title: string
    icon?: Component
    count?: number
    description?: string
  }>()
</script>

<template>
  <Card>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 text-base font-semibold">
          <component :is="icon" v-if="icon" :size="18" class="text-muted-color" />
          {{ title }}
          <span v-if="count !== undefined" class="text-muted-color">（{{ count }}）</span>
        </h2>
        <slot name="actions" />
      </div>
    </template>
    <template #content>
      <p v-if="description" class="mb-4 text-sm text-muted-color">{{ description }}</p>
      <slot />
    </template>
  </Card>
</template>
