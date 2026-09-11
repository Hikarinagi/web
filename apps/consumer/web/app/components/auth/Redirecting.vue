<script setup lang="ts">
  import { Spinner } from '@hina-ui/vue'
  defineProps<{ text: string }>()
</script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center gap-3 px-4 py-10 text-muted-color"
  >
    <Spinner size="lg" label="正在跳转" />
    <p class="text-sm">{{ text }}</p>
  </section>
</template>
