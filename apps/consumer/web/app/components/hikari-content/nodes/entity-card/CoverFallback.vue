<script setup lang="ts">
  import { Center } from '@hina-ui/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'HikariContentNodesEntityCardCoverFallback' })

  defineProps<{
    icon: Component
    size?: number
  }>()
</script>

<template>
  <Center as="span" class="absolute inset-0 text-muted">
    <component :is="icon" :size="size ?? 24" />
  </Center>
</template>
