<script setup lang="ts">
  import type { Component } from 'vue'

  defineOptions({ name: 'HikariContentNodesEntityCardCoverFallback' })

  defineProps<{
    icon: Component
    size?: number
  }>()
</script>

<template>
  <span class="absolute inset-0 flex items-center justify-center text-muted-color">
    <component :is="icon" :size="size ?? 24" />
  </span>
</template>
