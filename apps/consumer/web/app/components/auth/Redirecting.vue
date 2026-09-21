<script setup lang="ts">
  import { Spinner } from '@hina-ui/vue'
  defineProps<{ text: string }>()
</script>

<template>
  <section
    class="text-muted-color mx-auto flex min-h-[calc(100vh-var(--app-header-height))] w-full max-w-md flex-col items-center justify-center gap-3 px-4 py-10"
  >
    <Spinner size="lg" label="正在跳转" />
    <p class="text-sm">{{ text }}</p>
  </section>
</template>
