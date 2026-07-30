<script setup lang="ts">
  import type { Component } from 'vue'

  defineProps<{
    text: string
    icon?: Component
  }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <component :is="icon" v-if="icon" :size="28" class="text-muted-color opacity-60" />
    <p class="text-sm text-muted-color">{{ text }}</p>
  </div>
</template>
