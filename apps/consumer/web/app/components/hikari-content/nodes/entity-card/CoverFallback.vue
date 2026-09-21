<script setup lang="ts">
  import type { Component } from 'vue'

  defineOptions({ name: 'HikariContentNodesEntityCardCoverFallback' })

  defineProps<{
    icon: Component
    size?: number
  }>()
</script>

<template>
  <span class="text-muted-color absolute inset-0 flex items-center justify-center">
    <component :is="icon" :size="size ?? 24" />
  </span>
</template>
