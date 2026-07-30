<script setup lang="ts">
  defineProps<{ title: string }>()
</script>

<template>
  <section
    class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_1px_1.5px_rgba(15,23,42,0.05)] dark:border-surface-800 dark:bg-surface-900"
  >
    <p class="px-4 pt-3.5 pb-2.5 text-sm font-bold text-color">{{ title }}</p>
    <slot />
  </section>
</template>
