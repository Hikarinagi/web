<script setup lang="ts">
  import { Empty } from '@hina-ui/vue'
  import type { Component } from 'vue'

  defineProps<{
    text: string
    icon?: Component
  }>()
</script>

<template>
  <Empty :title="text" :icon="false">
    <template v-if="icon" #icon>
      <component :is="icon" class="size-7 text-muted opacity-60" />
    </template>
  </Empty>
</template>
